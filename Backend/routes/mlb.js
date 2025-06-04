const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const mongoose = require('mongoose');

router.get('/games', async (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ error: 'Missing date parameter' });
  try {
    const db = mongoose.connection.useDb('mlb');
    const gamesCollection = db.collection('games');
    const games = await gamesCollection.find({ $or: [ { date }, { game_date: date } ] }).toArray();
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/players/:team', async (req, res) => {
  const team = req.params.team;
  const category = req.query.category || 'hitting';
  const date = req.query.date;
  if (!date) return res.status(400).json({ error: 'Missing date parameter' });
  try {
    const db = mongoose.connection.useDb('mlb');
    const gamesCollection = db.collection('games');
    // Find the game(s) for the given date and team
    const games = await gamesCollection.find({
      $and: [
        { $or: [ { date }, { game_date: date } ] },
        { $or: [ { team1: team }, { team2: team } ] }
      ]
    }).toArray();
    if (!games.length) return res.json([]);
    let players = [];
    games.forEach(row => {
      if (category === 'pitching') {
        if (row.team1 === team && row.team1_pitcher) players.push(row.team1_pitcher);
        if (row.team2 === team && row.team2_pitcher) players.push(row.team2_pitcher);
      } else {
        if (row.team1 === team) {
          for (let i = 1; i <= 9; i++) if (row[`team1_batter${i}`]) players.push(row[`team1_batter${i}`]);
        }
        if (row.team2 === team) {
          for (let i = 1; i <= 9; i++) if (row[`team2_batter${i}`]) players.push(row[`team2_batter${i}`]);
        }
      }
    });
    players = [...new Set(players.filter(Boolean))];
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/live', async (req, res) => {
  try {
    const db = mongoose.connection.useDb('sportsAH');
    const collection = db.collection('live_mlb_games');
    const games = await collection.find({}).toArray();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch MLB live games' });
  }
});

router.get('/boxscores', async (req, res) => {
  try {
    const date = req.query.date;
    if (!date) return res.status(400).json({ error: 'Missing date parameter' });
    const db = mongoose.connection.useDb('sportsAH');
    const collection = db.collection('mlb_player_box_scores');
    const players = await collection.find({ gameDate: { $regex: `^${date}` } }).toArray();
    const flatPlayers = players.map(doc => ({
      ...doc.stats,
      playerName: doc.playerName,
      team: doc.team,
      opponent: doc.opponent,
      side: doc.side,
      position: doc.position,
      type: doc.type,
      date: doc.gameDate ? doc.gameDate.slice(0, 10) : date,
      matchup: `${doc.opponent} @ ${doc.team}`
    }));
    res.json(flatPlayers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching MLB player box scores' });
  }
});

module.exports = router;