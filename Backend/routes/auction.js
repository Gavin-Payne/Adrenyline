const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const User = require('../models/Users');
const mongoose = require('mongoose');
const verifyToken = require('../middleware/verifyToken');
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');
const path = require('path');
const { MongoClient } = require('mongodb');
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sports_trading';
let db;
MongoClient.connect(mongoUri, { useUnifiedTopology: true }).then(client => {
  db = client.db();
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { game, player, date, gameDate, condition, value, metric, duration, betSize, betType, multiplier, sport, sportCategory } = req.body;
    const expirationTime = new Date(Date.now() + duration * 60000);
    const auctionDate = new Date();
    const actualGameDate = gameDate ? new Date(gameDate) : new Date(date);
    let gameNumber = 1;
    if (typeof game === 'string' && /\(Game 2\)/i.test(game)) {
      gameNumber = 2;
    }
    const newAuction = new Auction({
      user: req.user.id,
      game,
      player,
      date: auctionDate,
      gameDate: actualGameDate,
      condition,
      value,
      metric,
      duration,
      betSize,
      betType,
      multiplier,
      expirationTime,
      sport,
      sportCategory,
      gameNumber
    });
    const auction = await newAuction.save();
    res.json(auction);
  } catch (err) {
    console.error('Error creating auction:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/buy/:id', verifyToken, async (req, res) => {
  try {
    const buyerId = req.user.id;
    const auctionId = req.params.id;
    const auction = await Auction.findById(auctionId).populate('user');
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }
    if (auction.soldTo) {
      return res.status(400).json({ success: false, message: 'Auction has already been sold' });
    }
    if (auction.expirationTime < new Date()) {
      return res.status(400).json({ success: false, message: 'Auction has expired' });
    }
    if (auction.user._id.toString() === buyerId) {
      return res.status(400).json({ success: false, message: 'You cannot buy your own auction' });
    }
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ success: false, message: 'Buyer not found' });
    }
    const currencyType = auction.betType;
    const betAmount = auction.betSize;
    if (buyer[currencyType] < betAmount) {
      return res.status(400).json({ success: false, message: `You don't have enough ${currencyType === 'gold' ? 'ALU' : 'SBM'} to buy this auction` });
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      buyer[currencyType] -= betAmount;
      auction.soldTo = buyerId;
      await buyer.save({ session });
      await auction.save({ session });
      await session.commitTransaction();
      session.endSession();
      res.json({
        success: true,
        message: 'Auction purchased successfully',
        data: {
          id: auction._id,
          game: auction.game,
          player: auction.player,
          betSize: auction.betSize,
          betType: auction.betType
        }
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Error buying auction:', error);
    res.status(500).json({ success: false, message: 'Server error buying auction', error: error.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const auctions = await Auction.find({ user: req.user.id, expirationTime: { $gt: now }, soldTo: null });
    res.json(auctions);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/all', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const auctions = await Auction.find({ expirationTime: { $gt: now }, soldTo: null });
    res.json(auctions);
  } catch (error) {
    console.error('Error fetching active auctions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/active', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const auctions = await Auction.find({ user: req.user.id, expirationTime: { $gt: now }, soldTo: null });
    res.json(auctions);
  } catch (error) {
    console.error('Error fetching active auctions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/games', async (req, res) => {
  const date = req.query.date;
  if (!date) {
    return res.status(400).json({ error: 'Missing date parameter' });
  }
  const formattedDate = moment(date).format('ddd, MMM D, YYYY');
  const dbPath = path.join(__dirname, '../../nba_schedule.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      return res.status(500).json({ error: 'Database connection error' });
    }
  });
  db.all("SELECT * FROM games WHERE date = ?", [formattedDate], (err, rows) => {
    if (err) {
      console.error("Error fetching games:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      const gameStrings = rows.map(row => `${row["visitor_team"]} vs ${row["home_team"]}`);
      res.json(gameStrings);
    }
    db.close();
  });
});

router.get('/successful', verifyToken, async (req, res) => {
  try {
    const auctions = await Auction.find({
      soldTo: { $ne: null },
      $or: [
        { user: req.user.id },
        { soldTo: req.user.id }
      ]
    })
    .populate('user', 'username _id')
    .populate('soldTo', 'username _id')
    .populate('winner', 'username _id');
    res.json(auctions);
  } catch (error) {
    console.error('Error fetching successful auctions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/processExpired', verifyToken, async (req, res) => {
  try {
    const expiredAuctions = await Auction.find({ expirationTime: { $lt: new Date() }, soldTo: null, refunded: false }).populate('user');
    let processedCount = 0;
    let errorCount = 0;
    for (const auction of expiredAuctions) {
      try {
        const user = auction.user;
        if (!user || !user._id) {
          errorCount++;
          continue;
        }
        const currencyToRefund = auction.betType;
        const refundAmount = auction.betSize;
        user[currencyToRefund] += refundAmount;
        auction.refunded = true;
        await Promise.all([
          auction.save(),
          user.save()
        ]);
        processedCount++;
      } catch (error) {
        errorCount++;
      }
    }
    res.json({
      success: true,
      message: `Processed ${processedCount} expired auctions`,
      data: { processed: processedCount, errors: errorCount }
    });
  } catch (error) {
    console.error('Error processing expired auctions:', error);
    res.status(500).json({ success: false, message: 'Server error processing expired auctions', error: error.message });
  }
});

router.post('/processCompleted', verifyToken, async (req, res) => {
  try {
    const pendingAuctions = await Auction.find({ soldTo: { $ne: null }, completed: { $ne: true } }).populate('user').populate('soldTo');
    const results = { processed: 0, playerDataFound: 0, completed: 0, errors: 0 };
    for (const auction of pendingAuctions) {
      try {
        const gameDate = auction.gameDate ? new Date(auction.gameDate) : new Date(auction.date);
        const formattedDate = gameDate.toISOString().split('T')[0];
        results.processed++;
        let playerBoxScore = null;
        let gameNumber = auction.gameNumber || auction.gameNum || auction.game_number || null;
        if (auction.sport === 'mlb') {
          const boxScoreQuery = {
            playerName: { $regex: new RegExp(`^${auction.player}$`, 'i') },
            gameDate: { $regex: `^${formattedDate}` }
          };
          if (gameNumber) {
            boxScoreQuery.$or = [
              { gameNumber: gameNumber },
              { gameNum: gameNumber },
              { game_number: gameNumber }
            ];
          }
          playerBoxScore = await db.collection('mlb_player_box_scores').findOne(boxScoreQuery);
          if (!playerBoxScore) {
            continue;
          }
          const isGameFinished = playerBoxScore.gameFinished === true || playerBoxScore.gameStatus === 'Final';
          let actualValue = null;
          switch (auction.metric.toLowerCase()) {
            case 'hits':
              actualValue = playerBoxScore.stats.hits;
              break;
            case 'walks':
              actualValue = playerBoxScore.stats.walks || playerBoxScore.stats.baseOnBalls;
              break;
            case 'strikeouts':
              actualValue = playerBoxScore.stats.strikeOuts;
              break;
            case 'total bases':
              actualValue = playerBoxScore.stats.totalBases;
              break;
            case 'steals':
              actualValue = playerBoxScore.stats.steals;
              break;
            case 'homeruns':
            case 'home runs':
              actualValue = playerBoxScore.stats.homeRuns;
              break;
            default:
              continue;
          }
          if (actualValue === null || actualValue === undefined) {
            continue;
          }
          const condition = auction.condition.toLowerCase();
          const targetValue = auction.value;
          // Only process if game is finished, or if over has already hit
          if (!isGameFinished && !(condition === 'over' && actualValue > targetValue)) {
            // Wait for game to finish unless over has already hit
            continue;
          }
          results.playerDataFound++;
          let winnerId = null;
          if (condition === 'over' && actualValue > targetValue) {
            winnerId = auction.user._id;
          } else if (condition === 'under' && actualValue < targetValue) {
            winnerId = auction.user._id;
          } else if (condition === 'exactly' && actualValue === targetValue) {
            winnerId = auction.user._id;
          } else if (condition === 'not exactly' && actualValue !== targetValue) {
            winnerId = auction.user._id;
          } else {
            winnerId = auction.soldTo._id;
          }
          const totalPot = auction.betSize * auction.multiplier;
          const winner = winnerId.equals(auction.user._id) ? auction.user : auction.soldTo;
          winner[auction.betType] += totalPot;
          await winner.save();
          auction.completed = true;
          auction.completedAt = new Date();
          auction.winner = winnerId;
          auction.actualValue = actualValue;
          auction.totalPot = totalPot;
          await auction.save();
          results.completed++;
          continue;
        }
        const nbaFormattedDate = gameDate.toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'});
        results.processed++;
        playerBoxScore = await db.collection('player_box_scores').findOne({ playerName: auction.player, gameDate: nbaFormattedDate });
        if (!playerBoxScore) {
          continue;
        }
        results.playerDataFound++;
        let actualValue = null;
        switch(auction.metric.toLowerCase()) {
          case 'points':
            actualValue = playerBoxScore.pts;
            break;
          case 'rebounds':
            actualValue = playerBoxScore.reb;
            break;
          case 'assists':
            actualValue = playerBoxScore.ast;
            break;
          case 'steals':
            actualValue = playerBoxScore.stl;
            break;
          case 'blocks':
            actualValue = playerBoxScore.blk;
            break;
          case 'points + rebounds':
            actualValue = (playerBoxScore.pts || 0) + (playerBoxScore.reb || 0);
            break;
          case 'points + assists':
            actualValue = (playerBoxScore.pts || 0) + (playerBoxScore.ast || 0);
            break;
          case 'points + rebounds + assists':
            actualValue = (playerBoxScore.pts || 0) + (playerBoxScore.reb || 0) + (playerBoxScore.ast || 0);
            break;
          case 'assists + rebounds':
            actualValue = (playerBoxScore.ast || 0) + (playerBoxScore.reb || 0);
            break;
          case 'blocks + steals':
            actualValue = (playerBoxScore.blk || 0) + (playerBoxScore.stl || 0);
            break;
          default:
            continue;
        }
        if (actualValue === null) {
          continue;
        }
        let winnerId = null;
        const condition = auction.condition.toLowerCase();
        const targetValue = auction.value;
        if (condition === 'over' && actualValue > targetValue) {
          winnerId = auction.user._id;
        } else if (condition === 'under' && actualValue < targetValue) {
          winnerId = auction.user._id;
        } else if (condition === 'exactly' && actualValue === targetValue) {
          winnerId = auction.user._id;
        } else if (condition === 'not exactly' && actualValue !== targetValue) {
          winnerId = auction.user._id;
        } else {
          winnerId = auction.soldTo._id;
        }
        const totalPot = auction.betSize * auction.multiplier;
        const winner = winnerId.equals(auction.user._id) ? auction.user : auction.soldTo;
        winner[auction.betType] += totalPot;
        await winner.save();
        auction.completed = true;
        auction.completedAt = new Date();
        auction.winner = winnerId;
        auction.actualValue = actualValue;
        auction.totalPot = totalPot;
        await auction.save();
        results.completed++;
      } catch (auctionError) {
        results.errors++;
      }
    }
    res.json({ message: "Completed auctions processed", results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/completed', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const completedAuctions = await Auction.find({
      completed: true,
      $or: [
        { user: userId },
        { soldTo: userId }
      ]
    })
    .populate('user', 'username')
    .populate('soldTo', 'username')
    .populate('winner', 'username')
    .sort({ completedAt: -1 });
    res.json(completedAuctions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/create', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { date, gameDate, game, player, condition, value, metric, betSize, betType, multiplier, duration, sport, sportCategory } = req.body;
    if (!betSize || isNaN(betSize) || betSize <= 0) {
      return res.status(400).json({ success: false, message: 'Bet size must be a positive number' });
    }
    let currencyField;
    if (betType === 'common' || betType === 'silver') {
      currencyField = 'silver';
    } else if (betType === 'premium' || betType === 'gold') {
      currencyField = 'gold';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid bet type' });
    }
    if (user[currencyField] < betSize) {
      return res.status(400).json({ success: false, message: `You don't have enough ${currencyField === 'gold' ? 'ALU' : 'SBM'} for this bet` });
    }
    const expirationTime = new Date(Date.now() + parseInt(duration) * 60000);
    let gameNumber = 1;
    if (typeof game === 'string' && /\(Game 2\)/i.test(game)) {
      gameNumber = 2;
    }
    const auction = new Auction({
      user: userId,
      date,
      gameDate,
      game,
      player,
      condition,
      value,
      metric,
      betSize,
      betType: currencyField,
      multiplier,
      duration,
      expirationTime,
      sport,       
      sportCategory,
      gameNumber
    });
    user[currencyField] -= betSize;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await auction.save({ session });
      await user.save({ session });
      await session.commitTransaction();
      session.endSession();
      res.status(201).json({ success: true, message: 'Auction created successfully', data: auction });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating auction', error: error.message });
  }
});

module.exports = router;