import requests
from datetime import datetime, timedelta
import time
import logging
import os
import sys
import json
from pymongo import MongoClient
from dotenv import load_dotenv
from nba_api.stats.endpoints import leaguegamefinder, boxscoretraditionalv2, playbyplayv2

NBA_TEAM_ABBRS = [
    'ATL', 'BOS', 'BKN', 'CHA', 'CHI', 'CLE', 'DAL', 'DEN', 'DET', 'GSW',
    'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA', 'MIL', 'MIN', 'NOP', 'NYK',
    'OKC', 'ORL', 'PHI', 'PHX', 'POR', 'SAC', 'SAS', 'TOR', 'UTA', 'WAS'
]

try:
    from nba_api.stats.endpoints import scoreboardv2
    # Create a compatible wrapper to match the old API usage
    class ScoreboardWrapper:
        def __init__(self, game_date=None):
            self.game_date = game_date
            
        def get_data_frames(self):
            sb = scoreboardv2.ScoreboardV2(game_date=self.game_date)
            return sb.get_data_frames()
    
    scoreboard = ScoreboardWrapper
except ImportError:
    # Keep fallback implementation if needed
    class FallbackScoreboard:
        def __init__(self, game_date=None):
            self.game_date = game_date
            
        def get_data_frames(self):
            # Use leaguegamefinder instead to get today's games
            today_date = self.game_date if self.game_date else datetime.now().strftime("%Y-%m-%d")
            game_finder = leaguegamefinder.LeagueGameFinder(
                date_from_nullable=today_date,
                date_to_nullable=today_date
            )
            games_df = game_finder.get_data_frames()[0]
            
            # Transform to match scoreboard format as closely as possible
            if not games_df.empty:
                # Add necessary columns that scoreboard would provide
                games_df['GAME_STATUS_TEXT'] = 'In Progress'  # Assume all games are in progress
                games_df['GAME_STATUS_ID'] = 2  # 2 means in progress
                games_df['PERIOD'] = 1  # Default to 1st period
                games_df['GAME_CLOCK'] = ''  # No clock info available
                
                # Identify home and away teams
                home_mask = games_df['MATCHUP'].str.contains(' vs. ')
                games_df.loc[home_mask, 'HOME_TEAM_ID'] = games_df.loc[home_mask, 'TEAM_ID']
                games_df.loc[home_mask, 'HOME_TEAM_NAME'] = games_df.loc[home_mask, 'TEAM_NAME']
                games_df.loc[home_mask, 'HOME_TEAM_CITY'] = ''
                games_df.loc[home_mask, 'HOME_TEAM_ABBREVIATION'] = games_df.loc[home_mask, 'TEAM_ABBREVIATION']
                games_df.loc[home_mask, 'HOME_TEAM_SCORE'] = games_df.loc[home_mask, 'PTS']
                
                # For away teams, we need to find their matching home games
                away_games = games_df[~home_mask].copy()
                for _, away_game in away_games.iterrows():
                    # Find the corresponding home game
                    matchup_parts = away_game['MATCHUP'].split(' @ ')
                    if len(matchup_parts) == 2:
                        home_team_abbr = matchup_parts[1]
                        home_game = games_df[(games_df['TEAM_ABBREVIATION'] == home_team_abbr) & home_mask]
                        
                        if not home_game.empty:
                            home_game_id = home_game.iloc[0]['GAME_ID']
                            # Now update the original away game entry with visitor info
                            games_df.loc[games_df['GAME_ID'] == home_game_id, 'VISITOR_TEAM_ID'] = away_game['TEAM_ID']
                            games_df.loc[games_df['GAME_ID'] == home_game_id, 'VISITOR_TEAM_NAME'] = away_game['TEAM_NAME']
                            games_df.loc[games_df['GAME_ID'] == home_game_id, 'VISITOR_TEAM_CITY'] = ''
                            games_df.loc[games_df['GAME_ID'] == home_game_id, 'VISITOR_TEAM_ABBREVIATION'] = away_game['TEAM_ABBREVIATION']
                            games_df.loc[games_df['GAME_ID'] == home_game_id, 'VISITOR_TEAM_SCORE'] = away_game['PTS']
                
                # Only keep home games for scoreboard format compatibility
                scoreboard_df = games_df[home_mask].copy()
                
                # Add default values for other expected columns
                scoreboard_df['HOME_TEAM_WINS'] = 0
                scoreboard_df['HOME_TEAM_LOSSES'] = 0
                scoreboard_df['VISITOR_TEAM_WINS'] = 0
                scoreboard_df['VISITOR_TEAM_LOSSES'] = 0
                scoreboard_df['SERIES_ID'] = ''
                scoreboard_df['SERIES_SUMMARY'] = ''
                scoreboard_df['ROUND_NUM'] = ''
                
                return [scoreboard_df]
            return [pd.DataFrame()]  # Empty DataFrame if no games
            
    scoreboard = FallbackScoreboard

# Rest of your imports
import pandas as pd

# Fix for Unicode encoding in logger
import codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)

# Configure NBA API request parameters - Fixed configuration
from nba_api import stats
# The correct way to set headers for NBA API
from nba_api.stats.library import http
http.STATS_HEADERS['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
http.TIMEOUT = 60  # Increase timeout to 60 seconds

# Load environment variables from .env file
load_dotenv()

# Set up logging with UTF-8 encoding
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("box_scores_api.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger()

# MongoDB connection
try:
    mongo_uri = os.environ.get('MONGODB_URI') or os.environ.get('MONGO_URI', 'mongodb://localhost:27017/sportsAH')
    logger.info(f"Using MongoDB URI: {mongo_uri[:20]}...")
    
    client = MongoClient(mongo_uri)
    db_name = os.environ.get('MONGODB_DATABASE', 'sportsAH')
    db = client[db_name]
    box_scores_collection = db['player_box_scores']
    
    client.admin.command('ping')
    logger.info("Successfully connected to MongoDB")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    sys.exit(1)

class NBABoxScoresAPI:
    def __init__(self):
        """Initialize the NBA box scores API client"""
        self.date_format = "%m/%d/%Y"
        
    def format_date(self, date_obj):
        """Format date as MM/DD/YYYY for the NBA stats URL"""
        return date_obj.strftime(self.date_format)
    
    def convert_to_date_obj(self, date_str):
        """Convert from MM/DD/YYYY to date object if needed"""
        if isinstance(date_str, str):
            return datetime.strptime(date_str, self.date_format).date()
        return date_str
        
    def get_box_scores(self, date=None):
        """Get box scores for specific date using NBA API"""
        if not date:
            date = datetime.now().date()
        
        if isinstance(date, str):
            date = self.convert_to_date_obj(date)
            
        formatted_date = self.format_date(date)
        logger.info(f"Fetching box scores for {formatted_date}")
        
        try:
            # Convert date to API format
            api_date_str = date.strftime("%m/%d/%Y")
            
            # Use leaguegamefinder to get games for the specified date
            game_finder = leaguegamefinder.LeagueGameFinder(
                date_from_nullable=api_date_str,
                date_to_nullable=api_date_str,
                league_id_nullable='00'  # Add this to specify NBA only (00 is NBA, 20 is G-League)
            )
            games_df = game_finder.get_data_frames()[0]
            
            if games_df.empty:
                return []
            # Filter to include only NBA teams
            games_df = games_df[games_df['TEAM_ABBREVIATION'].isin(NBA_TEAM_ABBRS)]
            # Get unique game IDs
            game_ids = games_df['GAME_ID'].unique()
            logger.info(f"Found {len(game_ids)} NBA games for {formatted_date}")
            all_box_scores = []
            # Process each game
            for game_id in game_ids:
                try:
                    box = boxscoretraditionalv2.BoxScoreTraditionalV2(game_id=game_id)
                    player_stats = box.get_data_frames()[0]
                    team_stats = box.get_data_frames()[1]
                    if player_stats.empty:
                        logger.warning(f"No box score data found for game {game_id}")
                        continue
                    
                    # Debug what's in team_stats
                    logger.debug(f"Team stats columns: {team_stats.columns.tolist()}")
                    if not team_stats.empty:
                        logger.debug(f"First team row: {team_stats.iloc[0].to_dict()}")
                    
                    # Get teams involved in this game - using a more robust approach
                    home_team_id = None
                    away_team_id = None
                    home_team_abbr = None
                    away_team_abbr = None
                    
                    # Check if we can identify teams by looking at all data available
                    if 'TEAM_CITY' in team_stats.columns:
                        # Try to find home/away by TEAM_CITY
                        for _, team_row in team_stats.iterrows():
                            if team_row['TEAM_CITY'] == 'Home':
                                home_team_id = team_row['TEAM_ID']
                                home_team_abbr = team_row['TEAM_ABBREVIATION']
                            elif team_row['TEAM_CITY'] == 'Away':
                                away_team_id = team_row['TEAM_ID']
                                away_team_abbr = team_row['TEAM_ABBREVIATION']
                    
                    # If that didn't work, try identifying by team names from the game finder
                    if not home_team_abbr or not away_team_abbr:
                        # Find teams in this game from game_finder
                        game_teams = games_df[games_df['GAME_ID'] == game_id]
                        
                        if len(game_teams) >= 2:  # We should have at least 2 teams
                            # Usually the home team is listed with a different format
                            home_idx = game_teams['MATCHUP'].str.contains(' vs. ').idxmax()
                            away_idx = game_teams['MATCHUP'].str.contains(' @ ').idxmax()
                            
                            if home_idx in game_teams.index:
                                home_team = game_teams.loc[home_idx]
                                home_team_id = home_team['TEAM_ID'] 
                                home_team_abbr = home_team['TEAM_ABBREVIATION']
                            
                            if away_idx in game_teams.index:
                                away_team = game_teams.loc[away_idx]
                                away_team_id = away_team['TEAM_ID']
                                away_team_abbr = away_team['TEAM_ABBREVIATION']
                    
                    # If we still don't have team abbreviations, extract from the first two rows
                    if not home_team_abbr or not away_team_abbr:
                        if len(team_stats) >= 2:
                            home_team_abbr = team_stats.iloc[0]['TEAM_ABBREVIATION']
                            away_team_abbr = team_stats.iloc[1]['TEAM_ABBREVIATION']
                            home_team_id = team_stats.iloc[0]['TEAM_ID']
                            away_team_id = team_stats.iloc[1]['TEAM_ID']
                    
                    if not home_team_abbr or not away_team_abbr:
                        logger.warning(f"Could not identify home/away teams for game {game_id}")
                        continue
                    
                    logger.info(f"Game {game_id}: {home_team_abbr} (home) vs {away_team_abbr} (away)")
                    
                    # Create matchup strings
                    home_matchup = f"{home_team_abbr} vs. {away_team_abbr}"
                    away_matchup = f"{away_team_abbr} @ {home_team_abbr}"
                    
                    # Get team scores to determine win/loss
                    try:
                        home_score = team_stats[team_stats['TEAM_ID'] == home_team_id]['PTS'].values[0]
                        away_score = team_stats[team_stats['TEAM_ID'] == away_team_id]['PTS'].values[0]
                    except (IndexError, KeyError):
                        # If we can't get scores by ID, try getting them by row index
                        if len(team_stats) >= 2:
                            home_score = team_stats.iloc[0]['PTS']
                            away_score = team_stats.iloc[1]['PTS']
                        else:
                            home_score = away_score = 0
                            logger.warning(f"Could not determine scores for game {game_id}")
                    
                    # Filter out non-NBA players
                    player_stats = player_stats[
                        player_stats['TEAM_ABBREVIATION'].isin(NBA_TEAM_ABBRS)
                    ]
                    
                    # Process each player
                    for _, player_row in player_stats.iterrows():
                        # Skip players who didn't play
                        if player_row['MIN'] is None or player_row['MIN'] == '':
                            continue
                            
                        team_id = player_row['TEAM_ID']
                        
                        # Determine team by matching player's team ID
                        if team_id == home_team_id:
                            team_abbr = home_team_abbr
                            matchup = home_matchup
                            win_loss = 'W' if home_score > away_score else 'L'
                        else:
                            team_abbr = away_team_abbr
                            matchup = away_matchup
                            win_loss = 'W' if away_score > home_score else 'L'
                            
                        # Parse minutes (format can be like "12:34" or "20.000000:12")
                        try:
                            min_value = player_row['MIN']
                            
                            # First ensure we have a string to work with
                            if min_value is None:
                                minutes = 0
                            else:
                                min_str = str(min_value).strip()
                                
                                if not min_str:
                                    minutes = 0
                                elif ':' in min_str:
                                    # Check if it's in "20.000000:12" format
                                    if '.' in min_str.split(':')[0]:
                                        # Handle "20.000000:12" format
                                        parts = min_str.split(':')
                                        minutes_part = float(parts[0].split('.')[0])  # Take just the integer part before decimal
                                        seconds_part = int(parts[1]) if parts[1] else 0
                                        minutes = minutes_part + (seconds_part / 60)
                                    else:
                                        # Regular "MM:SS" format
                                        min_parts = min_str.split(':')
                                        if len(min_parts) == 2:
                                            minutes = int(min_parts[0]) + (int(min_parts[1]) / 60)
                                        else:
                                            minutes = float(min_parts[0])
                                else:
                                    # Try to convert directly to float
                                    try:
                                        minutes = float(min_str)
                                    except ValueError:
                                        minutes = 0
                            
                            # Add debug logging to understand the original format
                            logger.debug(f"Parsed minutes for {player_row['PLAYER_NAME']}: original='{min_value}', parsed={minutes}")
                            
                            # Add check for players with minutes but also points (data validation)
                            if minutes == 0 and player_row['PTS'] > 0:
                                logger.warning(f"Player {player_row['PLAYER_NAME']} has 0 minutes but {player_row['PTS']} points - possible parsing error")
                                # Ensure some minimal playing time
                                minutes = 1.0
                                
                        except (ValueError, AttributeError, TypeError) as e:
                            logger.warning(f"Error parsing minutes for {player_row['PLAYER_NAME']}: {e}, raw value: {player_row['MIN']}")
                            # Try a different approach for problematic formats
                            try:
                                if ':' in str(player_row['MIN']):
                                    parts = str(player_row['MIN']).split(':')
                                    minutes_part = ''.join(c for c in parts[0] if c.isdigit() or c == '.')
                                    seconds_part = ''.join(c for c in parts[1] if c.isdigit())
                                    if minutes_part:
                                        minutes = float(minutes_part)
                                        if seconds_part:
                                            minutes += int(seconds_part) / 60
                                    else:
                                        minutes = 0
                                else:
                                    numeric_chars = ''.join(c for c in str(player_row['MIN']) if c.isdigit() or c == '.')
                                    minutes = float(numeric_chars) if numeric_chars else 0
                            except:
                                minutes = 0
                                # If player scored points, give them at least some minutes
                                if player_row['PTS'] > 0:
                                    minutes = 1.0
                        
                        # Format player data
                        player_data = {
                            'playerName': f"{player_row['PLAYER_NAME']}",
                            'teamAbbr': team_abbr,
                            'matchup': matchup,
                            'gameDate': formatted_date,
                            'gameId': game_id,
                            'scrapedAt': datetime.utcnow().isoformat(),
                            'winLoss': win_loss,
                            
                            # Stats
                            'min': round(minutes, 2),
                            'pts': player_row['PTS'],
                            'fgm': player_row['FGM'],
                            'fga': player_row['FGA'],
                            'fgp': player_row['FG_PCT'] * 100 if player_row['FGA'] > 0 else 0,
                            'tpm': player_row['FG3M'],
                            'tpa': player_row['FG3A'],
                            'tpp': player_row['FG3_PCT'] * 100 if player_row['FG3A'] > 0 else 0,
                            'ftm': player_row['FTM'],
                            'fta': player_row['FTA'],
                            'ftp': player_row['FT_PCT'] * 100 if player_row['FTA'] > 0 else 0,
                            'oreb': player_row['OREB'],
                            'dreb': player_row['DREB'],
                            'reb': player_row['REB'],
                            'ast': player_row['AST'],
                            'stl': player_row['STL'],
                            'blk': player_row['BLK'],
                            'tov': player_row['TO'],
                            'pf': player_row['PF'],
                            'plusMinus': player_row['PLUS_MINUS']
                        }
                        
                        # Calculate fantasy points
                        player_data['fantasyPoints'] = self.calculate_fantasy_points(player_data)
                        all_box_scores.append(player_data)
                            
                except Exception as e:
                    logger.error(f"Error processing box score for game {game_id}: {e}")
                    continue
            
            logger.info(f"Successfully fetched {len(all_box_scores)} player box scores for {formatted_date}")
            return all_box_scores
            
        except Exception as e:
            logger.error(f"Error fetching box scores via API: {e}")
            return []

    def calculate_fantasy_points(self, stats):
        """Calculate fantasy points based on stats (DraftKings format)"""
        fp = 0
        fp += stats['pts']
        fp += stats['tpm'] * 0.5
        fp += stats['reb'] * 1.25
        fp += stats['ast'] * 1.5
        fp += stats['stl'] * 2
        fp += stats['blk'] * 2
        fp -= stats['tov'] * 0.5
        
        # Check for double-double and triple-double
        categories = 0
        if stats['pts'] >= 10: categories += 1
        if stats['reb'] >= 10: categories += 1
        if stats['ast'] >= 10: categories += 1
        if stats['stl'] >= 10: categories += 1
        if stats['blk'] >= 10: categories += 1
        
        if categories >= 3:  # Triple-double
            fp += 3
        elif categories >= 2:  # Double-double
            fp += 1.5
            
        return round(fp, 2)
    
    def store_box_scores(self, box_scores):
        """Store the box scores in MongoDB"""
        if not box_scores:
            logger.warning("No box scores to store")
            return 0
            
        try:
            # Ensure index exists
            box_scores_collection.create_index([
                ("playerName", 1), 
                ("gameDate", 1)
            ], unique=True, background=True)
            
            # Insert or update each box score
            updated_count = 0
            for score in box_scores:
                if not score.get('playerName'):
                    continue
                    
                try:
                    result = box_scores_collection.update_one(
                        {
                            "playerName": score["playerName"],
                            "gameDate": score["gameDate"]
                        },
                        {"$set": score},
                        upsert=True
                    )
                    
                    if result.modified_count > 0 or result.upserted_id:
                        updated_count += 1
                except Exception as e:
                    logger.error(f"Error updating document for {score.get('playerName')}: {e}")
            
            logger.info(f"Successfully stored/updated {updated_count} box scores")
            return updated_count
            
        except Exception as e:
            logger.error(f"Error storing box scores in database: {e}")
            return 0
    def get_live_game_data(self, date=None):
        """Fetch live game data including play-by-play information"""
        if not date:
            date = datetime.now().date()
            
        if isinstance(date, str):
            date = self.convert_to_date_obj(date)
            
        formatted_date = self.format_date(date)
        logger.info(f"Fetching live game data for {formatted_date}")
        
        try:
            # First get today's games from scoreboard
            api_date = (date - timedelta(days=1)).strftime("%Y-%m-%d")
            sb = scoreboard.Scoreboard(game_date=api_date)
            games_data = sb.get_data_frames()[0]  # Games
            
            if games_data.empty:
                logger.warning(f"No games found for {formatted_date}")
                return []
                
            # Filter to include only NBA teams and active games
            # 1: Scheduled/Not Started, 2: In Progress, 3: Final
            active_games = games_data[
                (games_data['GAME_STATUS_ID'] <= 2) & 
                (games_data['HOME_TEAM_ABBREVIATION'].isin(NBA_TEAM_ABBRS)) &
                (games_data['VISITOR_TEAM_ABBREVIATION'].isin(NBA_TEAM_ABBRS))
            ]
            
            live_games = []
            
            for _, game in active_games.iterrows():
                game_id = game['GAME_ID']
                
                game_info = {
                    'gameId': game_id,
                    'gameStatus': game['GAME_STATUS_TEXT'],
                    'gameStatusId': int(game['GAME_STATUS_ID']),
                    'gameDate': formatted_date,
                    'homeTeam': {
                        'teamId': game['HOME_TEAM_ID'],
                        'teamName': game['HOME_TEAM_NAME'],
                        'teamCity': game['HOME_TEAM_CITY'],
                        'teamTricode': game['HOME_TEAM_ABBREVIATION'],
                        'score': int(game['HOME_TEAM_SCORE']) if not pd.isna(game['HOME_TEAM_SCORE']) else 0,
                        'record': f"{game['HOME_TEAM_WINS']}-{game['HOME_TEAM_LOSSES']}"
                    },
                    'awayTeam': {
                        'teamId': game['VISITOR_TEAM_ID'],
                        'teamName': game['VISITOR_TEAM_NAME'],
                        'teamCity': game['VISITOR_TEAM_CITY'],
                        'teamTricode': game['VISITOR_TEAM_ABBREVIATION'],
                        'score': int(game['VISITOR_TEAM_SCORE']) if not pd.isna(game['VISITOR_TEAM_SCORE']) else 0,
                        'record': f"{game['VISITOR_TEAM_WINS']}-{game['VISITOR_TEAM_LOSSES']}"
                    },
                    'gameClock': game['GAME_CLOCK'] if not pd.isna(game['GAME_CLOCK']) else "",
                    'period': int(game['PERIOD']) if not pd.isna(game['PERIOD']) else 0,
                    'playoffs': {
                        'roundNum': int(game['ROUND_NUM']) if not pd.isna(game['ROUND_NUM']) else None,
                        'seriesId': game['SERIES_ID'] if not pd.isna(game['SERIES_ID']) else None,
                        'seriesSummary': game['SERIES_SUMMARY'] if not pd.isna(game['SERIES_SUMMARY']) else None
                    },
                    'plays': []
                }
                
                # Only fetch play-by-play data for games in progress
                if game['GAME_STATUS_ID'] == 2:
                    try:
                        # Get recent plays
                        pbp = playbyplayv2.PlayByPlayV2(game_id=game_id)
                        plays_df = pbp.get_data_frames()[0]
                        
                        if not plays_df.empty:
                            # Get last 10 plays in reverse chronological order
                            recent_plays = plays_df.tail(10).iloc[::-1].to_dict('records')
                            
                            # Format each play
                            for play in recent_plays:
                                formatted_play = {
                                    'playId': int(play['EVENTNUM']) if not pd.isna(play['EVENTNUM']) else 0,
                                    'clock': play['PCTIMESTRING'] if not pd.isna(play['PCTIMESTRING']) else "",
                                    'period': int(play['PERIOD']) if not pd.isna(play['PERIOD']) else 0,
                                    'description': play['HOMEDESCRIPTION'] if not pd.isna(play['HOMEDESCRIPTION']) else 
                                                   play['VISITORDESCRIPTION'] if not pd.isna(play['VISITORDESCRIPTION']) else
                                                   play['NEUTRALDESCRIPTION'] if not pd.isna(play['NEUTRALDESCRIPTION']) else "",
                                    'homeScore': int(play['SCORE']) if not pd.isna(play['SCORE']) else None,
                                    'awayScore': int(play['SCORE']) if not pd.isna(play['SCORE']) else None,
                                    'isScoreChange': bool(play['SCORE'] != play['SCORE_MARGIN']) if not pd.isna(play['SCORE']) and not pd.isna(play['SCORE_MARGIN']) else False,
                                    'playType': play['EVENTMSGTYPE']
                                }
                                
                                # Extract score if available
                                if not pd.isna(play['SCORE']):
                                    try:
                                        scores = play['SCORE'].split(' - ')
                                        if len(scores) == 2:
                                            formatted_play['awayScore'] = int(scores[0])
                                            formatted_play['homeScore'] = int(scores[1])
                                    except:
                                        pass
                                        
                                game_info['plays'].append(formatted_play)
                    except Exception as e:
                        logger.error(f"Error fetching play-by-play for game {game_id}: {e}")
                
                live_games.append(game_info)
                
            return live_games
            
        except Exception as e:
            logger.error(f"Error fetching live game data: {e}")
            return []

    def store_live_games(self, live_games):
        """Store live game data in MongoDB"""
        if not live_games:
            logger.warning("No live games to store")
            return 0
            
        try:
            # Create/ensure index on live_games collection
            live_games_collection = db['live_games']
            live_games_collection.create_index([
                ("gameId", 1)
            ], unique=True, background=True)
            
            # Insert or update each game
            updated_count = 0
            for game in live_games:
                try:
                    result = live_games_collection.update_one(
                        {"gameId": game["gameId"]},
                        {"$set": {**game, "lastUpdated": datetime.utcnow().isoformat()}},
                        upsert=True
                    )
                    
                    if result.modified_count > 0 or result.upserted_id:
                        updated_count += 1
                except Exception as e:
                    logger.error(f"Error updating live game data for game {game.get('gameId')}: {e}")
            
            logger.info(f"Successfully stored/updated {updated_count} live games")
            return updated_count
            
        except Exception as e:
            logger.error(f"Error storing live games in database: {e}")
            return 0

def run_daily_fetch():
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)
    
    logger.info(f"Starting daily box score fetch for yesterday: {yesterday}")
    
    api = NBABoxScoresAPI()
    
    try:
        # First get yesterday's data since games should be complete
        yesterday_scores = api.get_box_scores(yesterday)
        stored_yesterday = api.store_box_scores(yesterday_scores)
        logger.info(f"Stored {stored_yesterday} box scores for {yesterday}")
        
        # Also get today's data for any completed games
        today_scores = api.get_box_scores(today)
        stored_today = api.store_box_scores(today_scores)
        logger.info(f"Stored {stored_today} box scores for {today}")
        
        return stored_yesterday + stored_today
    except Exception as e:
        logger.error(f"Error in daily fetch: {e}")
        return 0

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Fetch NBA player box scores')
    parser.add_argument('--date', type=str, help='Fetch specific date (MM/DD/YYYY)')
    parser.add_argument('--live', action='store_true', help='Fetch live game data')
    
    args = parser.parse_args()
    
    api = NBABoxScoresAPI()
    
    try:
        if args.live:
            today = datetime.now().date()
            live_games = api.get_live_game_data(today)
            api.store_live_games(live_games)
        elif args.date:
            date_obj = datetime.strptime(args.date, "%m/%d/%Y").date()
            box_scores = api.get_box_scores(date_obj)
            api.store_box_scores(box_scores)
        else:
            run_daily_fetch()
    except Exception as e:
        logger.error(f"Error in main execution: {e}")