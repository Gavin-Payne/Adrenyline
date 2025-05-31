import sys
import os
import time
import json
import logging
import requests
import concurrent.futures
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('MLB-LiveGames')
load_dotenv()

def get_mongodb_connection():
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/sports_trading')
    client = MongoClient(mongo_uri)
    return client

class MLBLiveGamesAPI:
    def __init__(self):
        self.SCOREBOARD_URL = "https://statsapi.mlb.com/api/v1/schedule?sportId=1&date={date}"
        self.GAME_URL = "https://statsapi.mlb.com/api/v1.1/game/{gamePk}/feed/live"
        self.client = get_mongodb_connection()
        self.db = self.client.get_database()
        self.live_games_collection = self.db.live_mlb_games

    def fetch_scoreboard(self, date_str):
        url = self.SCOREBOARD_URL.format(date=date_str)
        response = requests.get(url)
        return response.json()

    def fetch_game_data(self, game_pk):
        url = self.GAME_URL.format(gamePk=game_pk)
        response = requests.get(url)
        return response.json()

    def process_live_games(self):
        today = datetime.now().strftime("%Y-%m-%d")
        scoreboard = self.fetch_scoreboard(today)
        if not scoreboard or "dates" not in scoreboard or not scoreboard["dates"]:
            return
        games = scoreboard["dates"][0].get("games", [])
        active_game_ids = []
        def process_single_game(game):
            game_pk = game["gamePk"]
            game_data = self.fetch_game_data(game_pk)
            if not game_data:
                return None
            play_data = self.extract_play_by_play(game_data)
            game_info = {
                "gameId": game_pk,
                "status": game_data["gameData"]["status"]["detailedState"],
                "homeTeam": {
                    "name": game_data["gameData"]["teams"]["home"]["name"],
                    "abbreviation": game_data["gameData"]["teams"]["home"]["abbreviation"],
                    "score": game_data["liveData"]["linescore"]["teams"]["home"].get("runs", 0),
                    "players": self.extract_players(game_data, "home")
                },
                "awayTeam": {
                    "name": game_data["gameData"]["teams"]["away"]["name"],
                    "abbreviation": game_data["gameData"]["teams"]["away"]["abbreviation"],
                    "score": game_data["liveData"]["linescore"]["teams"]["away"].get("runs", 0),
                    "players": self.extract_players(game_data, "away")
                },
                "inning": game_data["liveData"]["linescore"].get("currentInning", 0),
                "inningHalf": game_data["liveData"]["linescore"].get("inningHalf", ""),
                "lastUpdated": datetime.now(),
                "playByPlay": play_data,
            }
            self.live_games_collection.update_one(
                {"gameId": game_pk},
                {"$set": game_info},
                upsert=True
            )
            return game_pk
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            future_to_game = {executor.submit(process_single_game, game): game for game in games}
            for future in concurrent.futures.as_completed(future_to_game):
                game_pk = future.result()
                if game_pk:
                    active_game_ids.append(game_pk)
        self.cleanup_old_games(active_game_ids)

    def extract_play_by_play(self, game_data):
        plays = game_data.get("liveData", {}).get("plays", {})
        all_plays = plays.get("allPlays", [])
        if not all_plays:
            return []
        at_bats = []
        player_lookup = game_data.get("gameData", {}).get("players", {})
        for play in all_plays:
            batter_obj = play.get("matchup", {}).get("batter", {})
            batter_id = batter_obj.get("id")
            strike_zone_top = None
            strike_zone_bottom = None
            if batter_id:
                player_key = f"ID{batter_id}"
                player_data = player_lookup.get(player_key, {})
                strike_zone_top = player_data.get("strikeZoneTop")
                strike_zone_bottom = player_data.get("strikeZoneBottom")
            at_bat = {
                "batter": batter_obj.get("fullName", ""),
                "batterId": batter_id,
                "strikeZoneTop": strike_zone_top,
                "strikeZoneBottom": strike_zone_bottom,
                "pitcher": play.get("matchup", {}).get("pitcher", {}).get("fullName", ""),
                "count": play.get("count", {}),
                "result": play.get("result", {}).get("event", ""),
                "description": play.get("result", {}).get("description", ""),
                "pitches": []
            }
            play_events = play.get("playEvents", [])
            for event in play_events:
                if not event.get("isPitch", False):
                    continue
                details = event.get("details", {})
                pitch_data = event.get("pitchData", {})
                coordinates = pitch_data.get("coordinates", {})
                breaks = pitch_data.get("breaks", {})
                px = coordinates.get("pX")
                pz = coordinates.get("pZ")
                at_bat["pitches"].append({
                    "pitchType": details.get("type", {}).get("description", ""),
                    "pitchTypeCode": details.get("type", {}).get("code", ""),
                    "pitchSpeed": pitch_data.get("startSpeed", None),
                    "endSpeed": pitch_data.get("endSpeed", None),
                    "spinRate": breaks.get("spinRate", None),
                    "spinAxis": breaks.get("spinAxis", None),
                    "releaseSpinRate": pitch_data.get("releaseSpinRate", None),
                    "releaseSpinAxis": pitch_data.get("releaseSpinAxis", None),
                    "breakAngle": breaks.get("breakAngle", None),
                    "breakLength": breaks.get("breakLength", None),
                    "breakY": breaks.get("breakY", None),
                    "extension": pitch_data.get("extension", None),
                    "releaseExtension": pitch_data.get("releaseSpinAxis", None),
                    "releasePosX": pitch_data.get("releasePosX", None),
                    "releasePosY": pitch_data.get("releasePosY", None),
                    "releasePosZ": pitch_data.get("releasePosZ", None),
                    "pX": coordinates.get("pX", None),
                    "pZ": coordinates.get("pZ", None),
                    "plateX": coordinates.get("plateX", None),
                    "plateZ": coordinates.get("plateZ", None),
                    "vx0": pitch_data.get("vx0", None),
                    "vy0": pitch_data.get("vy0", None),
                    "vz0": pitch_data.get("vz0", None),
                    "ax": pitch_data.get("ax", None),
                    "ay": pitch_data.get("ay", None),
                    "az": pitch_data.get("az", None),
                    "pfxX": pitch_data.get("pfxX", None),
                    "pfxZ": pitch_data.get("pfxZ", None),
                    "plateTime": pitch_data.get("plateTime", None),
                })
            at_bats.append(at_bat)
        return at_bats

    def extract_players(self, game_data, team_type):
        players = []
        try:
            team_players = game_data["liveData"]["boxscore"]["teams"][team_type]["players"]
            for player_id, player in team_players.items():
                batting = player.get("stats", {}).get("batting", {})
                pitching = player.get("stats", {}).get("pitching", {})
                fielding = player.get("stats", {}).get("fielding", {})
                players.append({
                    "name": player["person"]["fullName"],
                    "position": player.get("position", {}).get("abbreviation", ""),
                    "atBats": batting.get("atBats", 0),
                    "hits": batting.get("hits", 0),
                    "runs": batting.get("runs", 0),
                    "homeRuns": batting.get("homeRuns", 0),
                    "rbi": batting.get("rbi", 0),
                    "walks": batting.get("baseOnBalls", 0),
                    "strikeOuts": batting.get("strikeOuts", 0),
                    "avg": batting.get("avg", 0),
                    "obp": batting.get("obp", 0),
                    "slg": batting.get("slg", 0),
                    "ops": batting.get("ops", 0),
                    "inningsPitched": pitching.get("inningsPitched", 0),
                    "earnedRuns": pitching.get("earnedRuns", 0),
                    "pitchesThrown": pitching.get("pitchesThrown", 0),
                    "hitsAllowed": pitching.get("hits", 0),
                    "era": pitching.get("era", 0),
                    "strikeOuts": pitching.get("strikeOuts", 0),      
                    "baseOnBalls": pitching.get("baseOnBalls", 0),   
                    "assists": fielding.get("assists", 0),
                    "errors": fielding.get("errors", 0),
                    "putOuts": fielding.get("putOuts", 0),
                })
        except Exception as e:
            logger.error(f"Error extracting players for {team_type}: {e}")
        return players

    def cleanup_old_games(self, active_game_ids):
        try:
            result = self.live_games_collection.delete_many({
                "gameId": {"$nin": active_game_ids}
            })
            if result.deleted_count > 0:
                logger.info(f"Cleaned up {result.deleted_count} old MLB games from MongoDB")
        except Exception as e:
            logger.error(f"Error cleaning up old MLB games: {e}")

    def cleanup(self):
        if self.client:
            self.client.close()

def main():
    logger.info("Starting MLB live games update")
    start_time = time.time()
    api = MLBLiveGamesAPI()
    api.process_live_games()
    api.cleanup()
    elapsed = time.time() - start_time
    logger.info(f"MLB live games update completed in {elapsed:.2f} seconds")

if __name__ == "__main__":
    main()