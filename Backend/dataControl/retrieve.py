import sqlite3
from datetime import datetime

def get_games_on_date(date):
    dt = datetime.strptime(date, '%Y-%m-%d')
    try:
        formatted_date = dt.strftime('%a, %b %#d, %Y')
    except ValueError:
        try:
            formatted_date = dt.strftime('%a, %b %-d, %Y')
        except:
            formatted_date = dt.strftime('%a, %b %d, %Y')
            if formatted_date[8] == '0':
                formatted_date = formatted_date[:8] + formatted_date[9:]
    conn = sqlite3.connect('nba_schedule.db')
    c = conn.cursor()
    c.execute("SELECT * FROM games WHERE date = ?", (formatted_date,))
    games = c.fetchall()
    conn.close()
    return games

def get_all_players():
    conn = sqlite3.connect('nba_rosters.db')
    c = conn.cursor()
    c.execute("SELECT * FROM players")
    players = c.fetchall()
    conn.close()
    return players

players = get_all_players()
for row in players:
    print(row)

games = get_games_on_date('2025-3-4')
for game in games:
    print(game)
