const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const verifyToken = require('../middleware/verifyToken');

const BoxScoreSchema = new mongoose.Schema({
  playerName: String,
  teamAbbr: String,
  matchup: String,
  date: String,
  gameDate: String,
  winLoss: String,
  min: Number,
  pts: Number,
  fgm: Number,
  fga: Number,
  fgp: Number,
  tpm: Number,
  tpa: Number,
  tpp: Number,
  ftm: Number,
  fta: Number,
  ftp: Number,
  reb: Number,
  ast: Number,
  stl: Number,
  blk: Number,
  tov: Number,
  pf: Number,
  plusMinus: Number,
  scrapedAt: String
}, { collection: 'player_box_scores' });

const BoxScore = mongoose.model('player_box_scores', BoxScoreSchema);

// Get box scores for a specific date
router.get('/', [
  verifyToken,
  check('date').optional().isDate().withMessage('Date must be in YYYY-MM-DD format')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let date;
    if (req.query.date) {
      date = moment(req.query.date).format('MM/DD/YYYY');
    } else {
      date = moment().format('MM/DD/YYYY');
    }
    const boxScores = await BoxScore.find({ gameDate: date }).sort({ pts: -1 });
    res.json({
      success: true,
      date: date,
      count: boxScores.length,
      data: boxScores
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Get box scores for a specific player
router.get('/player/:playerName', [
  verifyToken,
  check('playerName').not().isEmpty().withMessage('Player name is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { playerName } = req.params;
    const nameRegex = new RegExp(playerName, 'i');
    const boxScores = await BoxScore.find({ playerName: nameRegex }).sort({ gameDate: -1 }).limit(20);
    res.json({
      success: true,
      count: boxScores.length,
      data: boxScores
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;