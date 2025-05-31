import sqlite3

def delete_all_from_nba_roster():
    db = sqlite3.connect('nba_rosters.db')
    cursor = db.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    for table in tables:
        table_name = table[0]
        if table_name == "sqlite_sequence":
            continue
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
        db.commit()
    db.close()

delete_all_from_nba_roster()

