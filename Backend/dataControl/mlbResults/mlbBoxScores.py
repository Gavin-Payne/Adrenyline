import requests
import json
from datetime import datetime, timedelta
from pathlib import Path
from pymongo import MongoClient
import os
import sys
from dotenv import load_dotenv
import pytz

load_dotenv()

def get_today_str():
    return datetime.now().strftime("%Y-%m-%d")

def fetch_mlb_schedule(date_str):
    url = f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&date={date_str}"
    resp = requests.get(url)
    resp.raise_for_status()
    return resp.json()

def fetch_boxscore(game_pk):
    url = f"https://statsapi.mlb.com/api/v1.1/game/{game_pk}/feed/live"
    resp = requests.get(url)
    resp.raise_for_status()
    return resp.json()

def extract_boxscores(game_data):
    boxscores = {"home": [], "away": []}
    for side in ["home", "away"]:
        team = game_data["liveData"]["boxscore"]["teams"][side]
        for player in team["players"].values():
            stats = player.get("stats", {})
            batting = stats.get("batting", {})
            if batting.get("atBats", 0) > 0 or batting.get("baseOnBalls", 0) > 0 or batting.get("hitByPitch", 0) > 0:
                boxscores[side].append({
                    "type": "batter",
                    "name": player["person"]["fullName"],
                    "position": player.get("position", {}).get("abbreviation", ""),
                    "atBats": batting.get("atBats", 0),
                    "hits": batting.get("hits", 0),
                    "runs": batting.get("runs", 0),
                    "homeRuns": batting.get("homeRuns", 0),
                    "rbi": batting.get("rbi", 0),
                    "walks": batting.get("baseOnBalls", 0),
                    "strikeOuts": batting.get("strikeOuts", 0),
                    "avg": batting.get("avg", ""),
                    "obp": batting.get("obp", ""),
                    "slg": batting.get("slg", ""),
                    "ops": batting.get("ops", "")
                })
            pitching = stats.get("pitching", {})
            if pitching.get("inningsPitched", 0) and float(pitching.get("inningsPitched", 0)) >= 0.1:
                boxscores[side].append({
                    "type": "pitcher",
                    "name": player["person"]["fullName"],
                    "inningsPitched": pitching.get("inningsPitched", 0),
                    "hitsAllowed": pitching.get("hits", 0),
                    "earnedRuns": pitching.get("earnedRuns", 0),
                    "strikeOuts": pitching.get("strikeOuts", 0),
                    "baseOnBalls": pitching.get("baseOnBalls", 0),
                    "pitchesThrown": pitching.get("pitchesThrown", 0),
                    "era": pitching.get("era", "")
                })
    return boxscores

def get_mongo_collection():
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        print("MONGO_URI not set in environment!")
        sys.exit(1)
    client = MongoClient(mongo_uri)
    db = client.get_database()
    return db.mlb_player_box_scores

def get_eastern_game_date(game_date_str):
    dt_utc = datetime.strptime(game_date_str, "%Y-%m-%dT%H:%M:%SZ")
    eastern = pytz.timezone('US/Eastern')
    dt_eastern = dt_utc.replace(tzinfo=pytz.utc).astimezone(eastern)
    if dt_eastern.hour < 6:
        dt_eastern -= timedelta(days=1)
    return dt_eastern.strftime("%Y-%m-%d")

def main():
    today = get_today_str()
    schedule = fetch_mlb_schedule(today)
    collection = get_mongo_collection()
    player_docs = []

    for date in schedule.get("dates", []):
        for game in date.get("games", []):
            game_pk = game["gamePk"]
            game_date = game.get("gameDate")
            eastern_game_date = get_eastern_game_date(game_date)
            home_team = game["teams"]["home"]["team"]["name"]
            home_abbr = game["teams"]["home"]["team"].get("abbreviation")
            away_team = game["teams"]["away"]["team"]["name"]
            away_abbr = game["teams"]["away"]["team"].get("abbreviation")
            try:
                game_data = fetch_boxscore(game_pk)
                boxscores = extract_boxscores(game_data)
                for side, players in boxscores.items():
                    team = home_team if side == "home" else away_team
                    team_abbr = home_abbr if side == "home" else away_abbr
                    opponent = away_team if side == "home" else home_team
                    opponent_abbr = away_abbr if side == "home" else home_abbr
                    for player in players:
                        doc = {
                            "gamePk": game_pk,
                            "gameDate": eastern_game_date,
                            "team": team,
                            "teamAbbr": team_abbr,
                            "opponent": opponent,
                            "opponentAbbr": opponent_abbr,
                            "side": side,
                            "playerName": player.get("name"),
                            "position": player.get("position", ""),
                            "type": player.get("type", ""),
                            "stats": player,
                            "gameStatus": game_data.get("gameData", {}).get("status", {}).get("abstractGameState", "")
                        }
                        player_docs.append(doc)
                print(f"Processed {len(boxscores['home']) + len(boxscores['away'])} players for game {game_pk}")
            except Exception as e:
                print(f"Failed to fetch/store boxscore for game {game_pk}: {e}")

    for doc in player_docs:
        collection.update_one(
            {"gamePk": doc["gamePk"], "playerName": doc["playerName"]},
            {"$set": doc},
            upsert=True
        )
    print(f"Stored {len(player_docs)} player box scores in MongoDB")

if __name__ == "__main__":
    main()