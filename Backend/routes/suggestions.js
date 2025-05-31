const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment');
const verifyToken = require('../middleware/verifyToken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const Auction = require('../models/Auction');

// Get bet suggestions for a specific date
router.get('/bet-suggestions', verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }
    
    // Format date for game lookup
    const dt = new Date(date);
    let formattedDate = moment(dt).format('ddd, MMM D, YYYY');
    
    // Step 1: First try to find the popular bets for this date
    // Look for auctions that are already created for this date
    const startOfDay = new Date(dt);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(dt);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find auctions for the selected date
    const auctions = await Auction.find({
      gameDate: { $gte: startOfDay, $lte: endOfDay },
      soldTo: null // Only unsold auctions (available for betting)
    })
    .sort({ createdAt: -1 }) // Get most recent first
    .limit(10);
    
    if (auctions.length > 0) {
      // Transform auctions into suggestion format
      const suggestions = auctions.map(auction => {
        return {
          player: auction.player,
          game: auction.game,
          metric: auction.metric,
          condition: auction.condition,
          value: auction.value,
          avgValue: auction.value + (auction.condition === 'over' ? 2 : -2), // Estimated avg for display
          confidence: Math.random() > 0.6 ? 'high' : 'medium', // Random confidence for now
          recommendation: `Popular bet: ${auction.player} ${auction.condition} ${auction.value} ${auction.metric}`,
          popularity: "Popular bet among users today"
        };
      });
      
      return res.json(suggestions);
    }
    
    // If no popular bets exist, check if we have games scheduled
    const dbPath = path.join(__dirname, '../../nba_schedule.db');
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        return res.status(500).json({ error: 'Database connection error' });
      }
    });
    
    db.all("SELECT * FROM games WHERE date = ?", [formattedDate], async (err, rows) => {
      if (err) {
        console.error("Error fetching games:", err.message);
        db.close();
        return res.status(500).json({ error: err.message });
      }
      
      // No games and no existing bets - tell user to check back later
      if (!rows || rows.length === 0) {
        db.close();
        return res.json({ noSuggestions: true, message: 'No games scheduled for this date.' });
      }
      
      // We have games but no popular bets yet
      if (auctions.length === 0) {
        db.close();
        return res.json({ 
          noSuggestions: true, 
          message: 'Check back later for popular bets on this date.',
          gamesScheduled: rows.length
        });
      }
      
      // This is a fallback that shouldn't normally be reached
      db.close();
      return res.json({ noSuggestions: true, message: 'No betting suggestions available yet.' });
    });
    
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

module.exports = router;