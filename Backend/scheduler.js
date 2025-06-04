const schedule = require('node-schedule'); 
const { spawn } = require('child_process');
const path = require('path');
const moment = require('moment');
const fs = require('fs');
const dotenv = require('dotenv');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Auction = require('./models/Auction');
const User = require('./models/Users');
const CommodityPrice = require('./models/CommodityPrice');
const fetch = require('node-fetch');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Connected to MongoDB for auction processing`))
  .catch(err => console.error(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] MongoDB connection error:`, err));

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

schedule.scheduleJob('0 6 * * *', () => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Running scheduled NBA box scores scraper...`);
  
  const scriptPath = path.join(__dirname, 'dataControl/playersBoxScores.py');
  
  const dateStr = moment().format('YYYY-MM-DD');
  const stdoutLog = fs.createWriteStream(path.join(logsDir, `boxscores-${dateStr}.log`), { flags: 'a' });
  const stderrLog = fs.createWriteStream(path.join(logsDir, `boxscores-${dateStr}-error.log`), { flags: 'a' });
  
  const pythonProcess = spawn('python', [scriptPath], {
    env: {
      ...process.env,
      MONGODB_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/sports_trading',
      MONGODB_COLLECTION: 'player_box_scores',
      SCRAPER_MODE: 'daily'
    }
  });
  
  pythonProcess.stdout.on('data', (data) => {
    const message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${data}`;
    console.log(message);
    stdoutLog.write(message);
  });
  
  pythonProcess.stderr.on('data', (data) => {
    const message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ERROR: ${data}`;
    console.error(message);
    stderrLog.write(message);
  });
  
  pythonProcess.on('close', (code) => {
    const message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] Box scores scraper process exited with code ${code}\n`;
    console.log(message);
    stdoutLog.write(message);
    
    stdoutLog.end();
    stderrLog.end();
    
    processCompletedAuctions();
  });
});

schedule.scheduleJob('0 3 * * 0', () => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Running weekly backfill of box scores...`);
  
  const scriptPath = path.join(__dirname, 'dataControl/playersBoxScores.py');
  const dateStr = moment().format('YYYY-MM-DD');
  const stdoutLog = fs.createWriteStream(path.join(logsDir, `boxscores-backfill-${dateStr}.log`), { flags: 'a' });
  const stderrLog = fs.createWriteStream(path.join(logsDir, `boxscores-backfill-${dateStr}-error.log`), { flags: 'a' });
  
  const pythonProcess = spawn('python', [scriptPath, '--backfill', '7'], {
    env: {
      ...process.env,
      MONGODB_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/sports_trading',
      MONGODB_COLLECTION: 'player_box_scores',
      SCRAPER_MODE: 'backfill'
    }
  });
  
  pythonProcess.stdout.on('data', (data) => {
    const message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${data}`;
    console.log(message);
    stdoutLog.write(message);
  });
  
  pythonProcess.stderr.on('data', (data) => {
    const message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ERROR: ${data}`;
    console.error(message);
    stderrLog.write(message);
  });
  
  pythonProcess.on('close', (code) => {
    const message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] Box scores backfill process exited with code ${code}\n`;
    console.log(message);
    stdoutLog.write(message);
    
    stdoutLog.end();
    stderrLog.end();
    
    processCompletedAuctions();
  });
});

schedule.scheduleJob('*/2 * * * *', () => {
  processCompletedAuctions();
});

let mlbLiveGamesRunning = false;
let mlbBoxScoresRunning = false;
let mlbGamesRunning = false;

schedule.scheduleJob('*/50 * * * * *', () => {
  if (mlbLiveGamesRunning) {
    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] MLB live games script is still running, skipping this cycle.`);
    return;
  }
  mlbLiveGamesRunning = true;
  const scriptPath = path.join(__dirname, 'dataControl/mlbLiveGames.py');
  const dateStr = moment().format('YYYY-MM-DD');
  const stdoutLog = fs.createWriteStream(path.join(logsDir, `mlb-live-${dateStr}.log`), { flags: 'a' });
  const stderrLog = fs.createWriteStream(path.join(logsDir, `mlb-live-${dateStr}-error.log`), { flags: 'a' });
  const pythonProcess = spawn('python', [scriptPath], {
    env: {
      ...process.env,
      MONGODB_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/sports_trading'
    }
  });
  pythonProcess.stdout.on('data', (data) => {
    const message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${data}`;
    stdoutLog.write(message);
  });
  pythonProcess.stderr.on('data', (data) => {
    const message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ERROR: ${data}`;
    stderrLog.write(message);
  });
  pythonProcess.on('close', (code) => {
    const message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] MLB live games script exited with code ${code}\n`;
    stdoutLog.write(message);
    stdoutLog.end();
    stderrLog.end();
    mlbLiveGamesRunning = false;
  });
});

schedule.scheduleJob('*/2 * * * *', () => {
  if (mlbBoxScoresRunning) {
    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] MLB box scores script is still running, skipping this cycle.`);
    return;
  }
  mlbBoxScoresRunning = true;
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Running scheduled MLB box scores scraper...`);
  const scriptPath = path.join(__dirname, 'dataControl/mlbResults/mlbBoxScores.py');
  const dateStr = moment().format('YYYY-MM-DD');
  const stdoutLog = fs.createWriteStream(path.join(logsDir, `mlb-boxscores-${dateStr}.log`), { flags: 'a' });
  const stderrLog = fs.createWriteStream(path.join(logsDir, `mlb-boxscores-${dateStr}-error.log`), { flags: 'a' });
  const pythonProcess = spawn('python', [scriptPath], {
    env: {
      ...process.env,
      MONGODB_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/sports_trading'
    }
  });
  pythonProcess.stdout.on('data', (data) => {
    const message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${data}`;
    console.log(message);
    stdoutLog.write(message);
  });
  pythonProcess.stderr.on('data', (data) => {
    const message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ERROR: ${data}`;
    console.error(message);
    stderrLog.write(message);
  });
  pythonProcess.on('close', (code) => {
    const message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] MLB box scores scraper exited with code ${code}\n`;
    console.log(message);
    stdoutLog.write(message);
    stdoutLog.end();
    stderrLog.end();
    mlbBoxScoresRunning = false;
  });
});

schedule.scheduleJob('*/5 * * * *', () => {
  if (mlbGamesRunning) {
    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] MLBGames.py script is still running, skipping this cycle.`);
    return;
  }
  mlbGamesRunning = true;
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Running scheduled MLBGames.py (all games DB) update...`);
  const scriptPath = path.join(__dirname, 'dataControl/MLBGames.py');
  const dateStr = moment().format('YYYY-MM-DD');
  const stdoutLog = fs.createWriteStream(path.join(logsDir, `mlbgames-${dateStr}.log`), { flags: 'a' });
  const stderrLog = fs.createWriteStream(path.join(logsDir, `mlbgames-${dateStr}-error.log`), { flags: 'a' });
  const pythonProcess = spawn('python', [scriptPath], {
    env: {
      ...process.env,
      MONGODB_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/sports_trading'
    }
  });
  pythonProcess.stdout.on('data', (data) => {
    const message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${data}`;
    console.log(message);
    stdoutLog.write(message);
  });
  pythonProcess.stderr.on('data', (data) => {
    const message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ERROR: ${data}`;
    console.error(message);
    stderrLog.write(message);
  });
  pythonProcess.on('close', (code) => {
    const message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] MLBGames.py exited with code ${code}\n`;
    console.log(message);
    stdoutLog.write(message);
    stdoutLog.end();
    stderrLog.end();
    mlbGamesRunning = false;
  });
});

async function processCompletedAuctions() {
  const logPrefix = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] [AUCTION-PROCESSOR]`;
  console.log(`${logPrefix} Starting to process completed auctions...`);
  
  try {
    const pendingAuctions = await Auction.find({
      soldTo: { $ne: null },
      completed: { $ne: true }
    }).populate('user').populate('soldTo');
    
    console.log(`${logPrefix} Found ${pendingAuctions.length} pending auctions to check against box scores`);
    
    let processed = 0;
    let playerDataFound = 0;
    let completedCount = 0;
    let errors = 0;
    let refundedCount = 0;

    for (const auction of pendingAuctions) {
      try {
        processed++;
        if (!auction.user || !auction.soldTo) continue;

        const gameDate = auction.gameDate ? new Date(auction.gameDate) : new Date(auction.date);
        const formattedDate = gameDate.toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'});
        
        const today = new Date();
        if (gameDate > today) {

          console.log(`${logPrefix} Game date ${formattedDate} hasn't occurred yet for auction ${auction._id}`);
          continue;
        }

        if (auction.sport !== 'mlb') {
          const db = mongoose.connection.db;
          let playerBoxScore = await db.collection('player_box_scores').findOne({
            playerName: auction.player,
            gameDate: { $regex: new RegExp(formattedDate) }
          });
          
          if (!playerBoxScore) {
            const altFormattedDate = gameDate.toLocaleDateString('en-US', {
              month: '2-digit', 
              day: '2-digit', 
              year: 'numeric'
            }).replace(/(\d+)\/(\d+)\/(\d+)/, '$1/$2/$3');
            
            const altPlayerBoxScore = await db.collection('player_box_scores').findOne({
              playerName: auction.player,
              gameDate: { $regex: new RegExp(altFormattedDate) }
            });
            
            if (!altPlayerBoxScore) {
              continue;
            } else {
              playerBoxScore = altPlayerBoxScore;
            }
          }
          
          playerDataFound++;

          if (!playerBoxScore.winLoss || (playerBoxScore.winLoss !== 'W' && playerBoxScore.winLoss !== 'L')) {
            console.log(`${logPrefix} Game not yet completed for ${auction.player} on ${formattedDate}`);
            continue;
          }

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
            case 'rebounds + assists':
              actualValue = (playerBoxScore.reb || 0) + (playerBoxScore.ast || 0);
              break;
            case 'blocks + steals':
              actualValue = (playerBoxScore.blk || 0) + (playerBoxScore.stl || 0);
              break;
            default:
              console.log(`${logPrefix} Unknown metric: ${auction.metric}`);
              continue;
          }
          
          if (actualValue === null) {
            console.log(`${logPrefix} Could not determine actual value for ${auction.metric}`);
            continue;
          }

          const targetValue = auction.value;
          const condition = auction.condition.toLowerCase();
          const isExactTie = actualValue === targetValue && condition === 'exactly';

          if (isExactTie || (actualValue === targetValue && (condition === 'over' || condition === 'under'))) {
            console.log(`${logPrefix} Exact match: ${actualValue} ${auction.metric} equals ${targetValue}. Processing refund.`);

            const sellerRefund = auction.betSize;
            const buyerRefund = auction.betSize * (auction.multiplier - 1); // Buyer's portion
            
            auction.user[auction.betType] += sellerRefund;
            auction.soldTo[auction.betType] += buyerRefund;
            
            auction.completed = true;
            auction.completedAt = new Date();
            auction.winner = null; // No winner in a tie
            auction.actualValue = actualValue;
            auction.refunded = true;

            await Promise.all([
              auction.user.save(),
              auction.soldTo.save(),
              auction.save()
            ]);
            
            console.log(`${logPrefix} Refunded for exact match - Seller: ${sellerRefund}, Buyer: ${buyerRefund}`);
            refundedCount++;
            continue;
          }
          
          let winnerId = null;
          let winnerIs = "";
          
          if ((condition === 'over' && actualValue > targetValue) || 
              (condition === 'under' && actualValue < targetValue) || 
              (condition === 'exactly' && actualValue === targetValue) || 
              (condition === 'not exactly' && actualValue !== targetValue)) {
            winnerId = auction.user._id;
            winnerIs = "seller";
          } else {
            winnerId = auction.soldTo._id;
            winnerIs = "buyer";
          }
          
          const totalPot = auction.betSize * auction.multiplier;
          const winner = winnerId.equals(auction.user._id) ? auction.user : auction.soldTo;
          winner[auction.betType] += totalPot;

          auction.completed = true;
          auction.completedAt = new Date();
          auction.winner = winnerId;
          auction.actualValue = actualValue;
          auction.totalPot = totalPot;

          await Promise.all([
            winner.save(),
            auction.save()
          ]);
          
          console.log(`${logPrefix} Auction ${auction._id} completed. Winner: ${winner.username} (${winnerIs}), Pot: ${totalPot}, Actual ${auction.metric}: ${actualValue} vs ${auction.condition} ${targetValue}`);
          completedCount++;
          
          if (winnerId.equals(auction.user._id)) {
            auction.user.wins = (auction.user.wins || 0) + 1;
            auction.soldTo.losses = (auction.soldTo.losses || 0) + 1;
          } else {
            auction.soldTo.wins = (auction.soldTo.wins || 0) + 1;
            auction.user.losses = (auction.user.losses || 0) + 1;
          }
          
          await auction.user.save();
          await auction.soldTo.save();
        } else {
          console.log(`${logPrefix} MLB auction processing: ${auction._id} for ${auction.player}`);

          const db = mongoose.connection.useDb('sportsAH');
          const collection = db.collection('mlb_player_box_scores');
          const searchDate = gameDate.toISOString().split('T')[0]; 

          const playerBoxScore = await collection.findOne({
            playerName: { $regex: new RegExp(`^${auction.player}$`, 'i') },
            gameDate: { $regex: `^${searchDate}` }
          });

          if (!playerBoxScore) {
            console.log(`No MLB box score found for player ${auction.player} on ${searchDate}`);
            continue;
          }
          
          playerDataFound++;
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
            case 'earned runs':
              actualValue = playerBoxScore.stats.earnedRuns;
              break;
            case 'pitching outs':
              const inningString = playerBoxScore.stats.inningsPitched || "0";
              const fullInnings = parseInt(inningString);
              const partialInning = inningString.includes('.') ? 
                parseInt(inningString.split('.')[1]) : 0;
              actualValue = (fullInnings * 3) + partialInning;
              break;
            default:
              console.log(`${logPrefix} Unknown MLB metric: ${auction.metric}`);
              continue;
          }
          
          if (actualValue === null || actualValue === undefined) {
            console.log(`${logPrefix} Could not determine actual value for MLB metric ${auction.metric} for ${auction.player}`);
            continue;
          }

          console.log(`${logPrefix} Found MLB statistic: ${auction.player} ${auction.metric}=${actualValue} vs ${auction.condition} ${auction.value}`);
          
          const targetValue = auction.value;
          const condition = auction.condition.toLowerCase();
          const isExactTie = actualValue === targetValue && condition === 'exactly';
          
          if (isExactTie || (actualValue === targetValue && (condition === 'over' || condition === 'under'))) {
            console.log(`${logPrefix} Exact match: ${actualValue} ${auction.metric} equals ${targetValue}. Processing refund.`);

            const sellerRefund = auction.betSize;
            const buyerRefund = auction.betSize * (auction.multiplier - 1);
            
            auction.user[auction.betType] += sellerRefund;
            auction.soldTo[auction.betType] += buyerRefund;
            
            auction.completed = true;
            auction.completedAt = new Date();
            auction.winner = null;
            auction.actualValue = actualValue;
            auction.refunded = true;
            
            await Promise.all([
              auction.user.save(),
              auction.soldTo.save(),
              auction.save()
            ]);
            
            console.log(`${logPrefix} Refunded for exact match - Seller: ${sellerRefund}, Buyer: ${buyerRefund}`);
            refundedCount++;
            continue;
          }
          
          let winnerId = null;
          let winnerIs = "";
          
          if ((condition === 'over' && actualValue > targetValue) || 
              (condition === 'under' && actualValue < targetValue) || 
              (condition === 'exactly' && actualValue === targetValue) || 
              (condition === 'not exactly' && actualValue !== targetValue)) {
            winnerId = auction.user._id;
            winnerIs = "seller";
          } else {
            winnerId = auction.soldTo._id;
            winnerIs = "buyer";
          }

          const totalPot = auction.betSize * auction.multiplier;

          const winner = winnerId.equals(auction.user._id) ? auction.user : auction.soldTo;
          winner[auction.betType] += totalPot;

          auction.completed = true;
          auction.completedAt = new Date();
          auction.winner = winnerId;
          auction.actualValue = actualValue;
          auction.totalPot = totalPot;

          await Promise.all([
            winner.save(),
            auction.save()
          ]);
          
          console.log(`${logPrefix} MLB Auction ${auction._id} completed. Winner: ${winner.username} (${winnerIs}), Pot: ${totalPot}, Actual ${auction.metric}: ${actualValue} vs ${auction.condition} ${targetValue}`);
          completedCount++;
          if (winnerId.equals(auction.user._id)) {
            auction.user.wins = (auction.user.wins || 0) + 1;
            auction.soldTo.losses = (auction.soldTo.losses || 0) + 1;
          } else {
            auction.soldTo.wins = (auction.soldTo.wins || 0) + 1;
            auction.user.losses = (auction.user.losses || 0) + 1;
          }

          await auction.user.save();
          await auction.soldTo.save();
        }
      } catch (auctionError) {
        console.error(`${logPrefix} Error processing auction:`, auctionError);
        errors++;
      }
    } 

    console.log(`${logPrefix} Completed auction processing summary:`);
    console.log(`${logPrefix} - Processed: ${processed}`);
    console.log(`${logPrefix} - Player data found: ${playerDataFound}`);
    console.log(`${logPrefix} - Completed: ${completedCount}`);
    console.log(`${logPrefix} - Refunded ties: ${refundedCount}`);
    console.log(`${logPrefix} - Errors: ${errors}`);

  } catch (error) {
    console.error(`${logPrefix} Error processing completed auctions:`, error);
  }
}

async function processExpiredAuctions() {
  const logPrefix = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] [EXPIRED-PROCESSOR]`;
  console.log(`${logPrefix} Starting to process expired auctions...`);
  
  try {
    const expiredAuctions = await Auction.find({
      expirationTime: { $lt: new Date() },
      soldTo: null,
      refunded: false
    }).populate('user');
    
    console.log(`${logPrefix} Found ${expiredAuctions.length} expired auctions to process`);
    
    let processedCount = 0;
    let errorCount = 0;

    for (const auction of expiredAuctions) {
      try {
        const user = auction.user;

        if (!user || !user._id) {
          console.error(`${logPrefix} User not found for auction ${auction._id}`);
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
        
        console.log(`${logPrefix} Refunded ${refundAmount} ${currencyToRefund} to user ${user.username} for expired auction ${auction._id}`);
        processedCount++;
      } catch (error) {
        console.error(`${logPrefix} Error processing expired auction ${auction._id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`${logPrefix} Completed expired auction processing summary:`);
    console.log(`${logPrefix} - Processed: ${expiredAuctions.length}`);
    console.log(`${logPrefix} - Refunded: ${processedCount}`);
    console.log(`${logPrefix} - Errors: ${errorCount}`);
    
  } catch (error) {
    console.error(`${logPrefix} Error processing expired auctions:`, error);
  }
}

schedule.scheduleJob('0 * * * *', () => {
  processExpiredAuctions();
});
processCompletedAuctions();