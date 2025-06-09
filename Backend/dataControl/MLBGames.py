import os
from datetime import datetime, timezone
import requests
from bs4 import BeautifulSoup, NavigableString
import unicodedata
from pymongo import MongoClient
from dotenv import load_dotenv
import pytz

DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "mlbDBs"))
os.makedirs(DB_DIR, exist_ok=True)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

def remove_accents(name):
    nfkd_form = unicodedata.normalize('NFKD', name)
    return ''.join([c for c in nfkd_form if not unicodedata.combining(c)])

url = "https://www.mlb.com/starting-lineups"
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')
lineup_sections = soup.find_all('div', class_='starting-lineups__matchup')
if not lineup_sections:
    lineup_sections = soup.find_all('section', class_='starting-lineups')

games_today = []
for section in lineup_sections:
    team_names_div = section.find('div', class_='starting-lineups__team-names')
    if not team_names_div:
        continue
    spans = team_names_div.find_all('span', class_='starting-lineups__team-name')
    teams = []
    for span in spans:
        if span.get('class') and 'starting-lineups__team-name--at' in span.get('class'):
            continue
        link = span.find('a', class_='starting-lineups__team-name--link')
        if link:
            team_name = remove_accents(link.get_text(strip=True))
            teams.append(team_name)
        else:
            teams.append("Unknown")
    player_list = section.find_all('ol', class_='starting-lineups__team')
    player_list = [player_list[i] for i in range(len(player_list)) if i % 4 < 2]
    if len(teams) != len(player_list):
        continue
    pitcher_elements = section.find_all('div', class_='starting-lineups__pitcher-name')
    pitcher_names = []
    for pitcher_element in pitcher_elements:
        pitcher_link = pitcher_element.find('a')
        if pitcher_link:
            full_pitcher_name = remove_accents(pitcher_link.get_text(strip=True))
            pitcher_names.append(full_pitcher_name)
        else:
            pitcher_names.append("Unknown Pitcher")
    game_date = ''
    game_time_str = ''
    game_park = ''
    details_div = section.find('div', class_='starting-lineups__game-details')
    if details_div:
        date_time_div = details_div.find('div', class_='starting-lineups__game-date-time')
        if date_time_div:
            time_tag = date_time_div.find('time')
        else:
            time_tag = details_div.find('time')
        park_div = details_div.find('div', class_='starting-lineups__game-location')
        if park_div:
            game_park = park_div.get_text(strip=True)
    else:
        time_tag = section.find('time')
        park_div = section.find('div', class_='starting-lineups__game-location')
        if park_div:
            game_park = park_div.get_text(strip=True)
    if time_tag:
        visible_time = ''
        next_sib = time_tag.next_sibling
        while next_sib and (isinstance(next_sib, NavigableString) and not next_sib.strip()):
            next_sib = next_sib.next_sibling
        if isinstance(next_sib, NavigableString):
            visible_time = next_sib.strip()
        if not visible_time:
            visible_time = time_tag.get_text(strip=True)
        if visible_time:
            game_time_str = f"{visible_time} ET"
        else:
            game_time_str = ''
        if time_tag.has_attr('datetime'):
            dt = time_tag['datetime']
            try:
                dt_obj = datetime.fromisoformat(dt.replace('Z', '+00:00'))
                eastern = pytz.timezone('US/Eastern')
                dt_eastern = dt_obj.astimezone(eastern)
                game_date = dt_eastern.strftime('%Y-%m-%d')
            except Exception as e:
                game_date = datetime.now().strftime('%Y-%m-%d')
        else:
            game_date = datetime.now().strftime('%Y-%m-%d')
    else:
        game_time_str = ''
        game_date = datetime.now().strftime('%Y-%m-%d')
    for game_index in range(0, len(teams), 2):
        if game_index + 1 >= len(teams) or len(pitcher_names) <= game_index + 1:
            continue
        team1 = teams[game_index]
        team2 = teams[game_index + 1]
        team1_players = player_list[game_index]
        team2_players = player_list[game_index + 1]
        team1_pitcher = pitcher_names[game_index]
        team2_pitcher = pitcher_names[game_index + 1]
        def get_batters(team_players):
            batters = []
            players = team_players.find_all('li', class_='starting-lineups__player')
            for player in players:
                player_tag = player.find('a')
                if player_tag:
                    player_name = remove_accents(player_tag.get_text(strip=True))
                else:
                    player_name = "Unknown"
                batters.append(player_name)
            while len(batters) < 9:
                batters.append("")
            return batters[:9]
        team1_batters = get_batters(team1_players)
        team2_batters = get_batters(team2_players)
        games_today.append({
            "team1": team1,
            "team2": team2,
            "team1_batters": team1_batters,
            "team2_batters": team2_batters,
            "team1_pitcher": team1_pitcher,
            "team2_pitcher": team2_pitcher,
            "game_time": game_time_str,
            "game_date": game_date,
            "game_park": game_park
        })
game_counts = {}
pacific = pytz.timezone('US/Pacific')
today_str = datetime.now(pacific).strftime("%Y-%m-%d")
all_games_db_name = "MLBGames.db"
all_games_db_path = os.path.join(DB_DIR, all_games_db_name)
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    raise Exception("MONGO_URI environment variable not set. Please set it to your MongoDB Atlas connection string.")
client = MongoClient(MONGO_URI)
db = client['mlb']
games_collection = db['games']
for game in games_today:
    base_name = f"{game['team1'].replace(' ', '')}VS{game['team2'].replace(' ', '')}"
    count = game_counts.get(base_name, 0) + 1
    game_counts[base_name] = count
    game_id = f"{base_name}{count if count > 1 else ''}_{today_str}"
    team1_batters = (game['team1_batters'] + [""] * 9)[:9]
    team2_batters = (game['team2_batters'] + [""] * 9)[:9]
    doc = {
        "game_id": game_id,
        "date": game.get('game_date', today_str),
        "team1": game['team1'],
        "team2": game['team2'],
        "team1_batters": team1_batters,
        "team2_batters": team2_batters,
        "team1_pitcher": game['team1_pitcher'],
        "team2_pitcher": game['team2_pitcher'],
        "game_time": game.get('game_time', ''),
        "game_date": game.get('game_date', today_str),
        "game_park": game.get('game_park', '')
    }
    games_collection.replace_one({"game_id": game_id}, doc, upsert=True)
    print(f"DEBUG: Upserted game_id {game_id}")