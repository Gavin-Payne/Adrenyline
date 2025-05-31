const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

router.get('/:team', async (req, res) => {
  const team = req.params.team;
  try {
    const dbPath = path.join(__dirname, '../../nba_rosters.db');
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
    db.all("SELECT * FROM players WHERE team = ?", [team], (err, rows) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }
      let players = [];
      if (rows && rows.length > 0) {
        players = rows.map(row => {
          if (Array.isArray(row)) {
            return row[2];
          } else if (typeof row === 'object') {
            return row.player || row.player_name || row[2];
          } else {
            return String(row);
          }
        });
      }
      db.close();
      res.json(players.filter(p => p !== null && p !== undefined));
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;