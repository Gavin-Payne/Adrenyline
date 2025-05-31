import sys
import os
import time
import json
import logging
import requests
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('NBA-LiveGames')
load_dotenv()
def get_mongodb_connection():
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/sports_trading')
    client = MongoClient(mongo_uri)
    return client
def safe_get(data, *keys, default=None):
    current = data
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return default
    return current
class NBALiveGamesAPI:
    def __init__(self):
        self.NBA_SCOREBOARD_URL = "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json"
        self.PLAYS_URL = "https://cdn.nba.com/static/json/liveData/playbyplay/playbyplay_"
        self.BOXSCORE_URL = "https://cdn.nba.com/static/json/liveData/boxscore/boxscore_"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://www.nba.com',
            'Referer': 'https://www.nba.com/',
        }
        self.client = get_mongodb_connection()
        self.db = self.client.get_database()
        self.live_games_collection = self.db.live_games
        logger.info(f"Using MongoDB collection: {self.live_games_collection.name}")
    def fetch_scoreboard(self):
        response = requests.get(self.NBA_SCOREBOARD_URL, headers=self.headers, timeout=15)
        if response.status_code != 200:
            return None
        data = response.json()
        if 'scoreboard' not in data:
            return None
        return data
    def fetch_game_plays(self, game_id):
        url = f"{self.PLAYS_URL}{game_id}.json"
        response = requests.get(url, headers=self.headers, timeout=10)
        if response.status_code != 200:
            return None
        return response.json()
    def fetch_game_stats(self, game_id):
        url = f"{self.BOXSCORE_URL}{game_id}.json"
        response = requests.get(url, headers=self.headers, timeout=10)
        if response.status_code != 200:
            return None
        return response.json()
    def process_live_games(self):
        scoreboard_data = self.fetch_scoreboard()
        if not scoreboard_data or 'scoreboard' not in scoreboard_data:
            return False
        games = scoreboard_data['scoreboard'].get('games', [])
        if not games:
            return True
        active_game_ids = []
        player_box_scores = self.load_all_player_box_scores()
        for game in games:
            game_id = game['gameId']
            active_game_ids.append(game_id)
            status_id = safe_get(game, 'gameStatus', default=1)
            game_data = {
                'gameId': game_id,
                'status': status_id,
                'statusText': safe_get(game, 'gameStatusText', default='Scheduled'),
                'gameStatusId': status_id,
                'gameStatus': self.get_game_status_text(status_id),
                'lastUpdated': datetime.now(),
                'homeTeamId': safe_get(game, 'homeTeam', 'teamId', default=None),
                'homeTeamName': safe_get(game, 'homeTeam', 'teamName', default='Unknown'),
                'homeTeamCity': safe_get(game, 'homeTeam', 'teamCity', default=''),
                'homeTeamTricode': safe_get(game, 'homeTeam', 'teamTricode', default=''),
                'homeScore': safe_get(game, 'homeTeam', 'score', default=0),
                'awayTeamId': safe_get(game, 'awayTeam', 'teamId', default=None),
                'awayTeamName': safe_get(game, 'awayTeam', 'teamName', default='Unknown'),
                'awayTeamCity': safe_get(game, 'awayTeam', 'teamCity', default=''),
                'awayTeamTricode': safe_get(game, 'awayTeam', 'teamTricode', default=''),
                'awayScore': safe_get(game, 'awayTeam', 'score', default=0),
                'homeTeam': {
                    'teamId': safe_get(game, 'homeTeam', 'teamId', default=None),
                    'teamName': safe_get(game, 'homeTeam', 'teamName', default='Unknown'),
                    'teamCity': safe_get(game, 'homeTeam', 'teamCity', default=''),
                    'teamTricode': safe_get(game, 'homeTeam', 'teamTricode', default=''),
                    'teamSlug': safe_get(game, 'homeTeam', 'teamSlug', default=''),
                    'wins': safe_get(game, 'homeTeam', 'wins', default=0),
                    'losses': safe_get(game, 'homeTeam', 'losses', default=0),
                    'score': safe_get(game, 'homeTeam', 'score', default=0),
                    'seed': safe_get(game, 'homeTeam', 'seed', default=None),
                    'inBonus': safe_get(game, 'homeTeam', 'inBonus', default=None),
                    'timeoutsRemaining': safe_get(game, 'homeTeam', 'timeoutsRemaining', default=None),
                },
                'awayTeam': {
                    'teamId': safe_get(game, 'awayTeam', 'teamId', default=None),
                    'teamName': safe_get(game, 'awayTeam', 'teamName', default='Unknown'),
                    'teamCity': safe_get(game, 'awayTeam', 'teamCity', default=''),
                    'teamTricode': safe_get(game, 'awayTeam', 'teamTricode', default=''),
                    'teamSlug': safe_get(game, 'awayTeam', 'teamSlug', default=''),
                    'wins': safe_get(game, 'awayTeam', 'wins', default=0),
                    'losses': safe_get(game, 'awayTeam', 'losses', default=0),
                    'score': safe_get(game, 'awayTeam', 'score', default=0),
                    'seed': safe_get(game, 'awayTeam', 'seed', default=None),
                    'inBonus': safe_get(game, 'awayTeam', 'inBonus', default=None),
                    'timeoutsRemaining': safe_get(game, 'awayTeam', 'timeoutsRemaining', default=None),
                },
            }
            self.live_games_collection.update_one(
                {'gameId': game_id},
                {'$set': game_data},
                upsert=True
            )
        return True
    def load_all_player_box_scores(self):
        return []
    def get_game_status_text(self, status_id):
        return ''

def main():
    logger.info("Starting NBA live games update")
    start_time = time.time()
    
    api = NBALiveGamesAPI()
    success = api.process_live_games()
    api.cleanup()
    
    elapsed = time.time() - start_time
    logger.info(f"Live games update {'completed successfully' if success else 'failed'} in {elapsed:.2f} seconds")


if __name__ == "__main__":
    main()