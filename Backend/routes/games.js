const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const path = require('path');
const moment = require('moment');

// Helper function to run the Python script
const runPythonScript = async (args = []) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../dataControl/playersBoxScores.py');
    
    const pythonProcess = spawn('python', [scriptPath, ...args]);
    
    let stdoutData = '';
    let stderrData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        console.error(`Error output: ${stderrData}`);
        reject(new Error(`Python script execution failed with code ${code}`));
      } else {
        resolve(stdoutData);
      }
    });
  });
};

// Update the live games route to use the new Python script

// @route   GET api/games/live
// @desc    Get live games
// @access  Public (no auth required)
router.get('/live', async (req, res) => {
  try {
    // Get access to the MongoDB collections
    const db = mongoose.connection.db;
    const liveGamesCollection = db.collection('live_games');
    
    // Check if the request explicitly asks for a refresh
    if (req.query.refresh === 'true') {
      console.log('[GAMES-API] Explicitly requested refresh, triggering Python script...');
      
      // Run the script synchronously with a short timeout
      const scriptPath = path.join(__dirname, '../dataControl/liveGames.py');
      const pythonProcess = spawn('python', [scriptPath]);
      
      // Set a timeout to ensure we don't wait too long
      const timeout = setTimeout(() => {
        console.log('[GAMES-API] Python script taking too long, killing process...');
        pythonProcess.kill();
      }, 10000); // 10 second timeout
      
      // Handle completion
      await new Promise((resolve) => {
        pythonProcess.on('close', (code) => {
          clearTimeout(timeout);
          console.log(`[GAMES-API] Python script completed with code ${code}`);
          resolve();
        });
      });
      
      console.log('[GAMES-API] Refresh completed, fetching updated data...');
    }
    
    // Get fresh data from the database
    const games = await liveGamesCollection.find({}).toArray();
    
    if (games.length > 0) {
      console.log(`[GAMES-API] Returning ${games.length} live games, first game has ${games[0].homeTeam?.players?.length || 0} home players and ${games[0].awayTeam?.players?.length || 0} away players`);
      return res.json(games);
    } else {
      console.log('[GAMES-API] No live games found in database');
      return res.json([]);
    }
  } catch (err) {
    console.error('Error fetching live games:', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/games/date/:date
// @desc    Get games for a specific date (format: MM/DD/YYYY)
// @access  Public
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return res.status(400).json({ error: 'Invalid date format. Use MM/DD/YYYY' });
    }
    
    // Get access to the MongoDB collections
    const db = mongoose.connection.db;
    const boxScoresCollection = db.collection('player_box_scores');
    
    // Query for box scores on that date
    const boxScores = await boxScoresCollection.find({ gameDate: date }).toArray();
    
    if (boxScores.length === 0) {
      // If no data in DB, try to fetch it with Python script
      console.log(`[GAMES-API] No box scores found for ${date}, fetching from NBA API...`);
      try {
        await runPythonScript(['--date', date]);
        
        // Try querying again
        const refreshedBoxScores = await boxScoresCollection.find({ gameDate: date }).toArray();
        
        if (refreshedBoxScores.length === 0) {
          return res.json([]);
        }
        
        // Group by gameId to form complete games
        const games = processBoxScoresToGames(refreshedBoxScores);
        return res.json(games);
      } catch (error) {
        console.error(`[GAMES-API] Error fetching data for ${date}:`, error);
        return res.json([]);
      }
    }
    
    // Group by gameId to form complete games
    const games = processBoxScoresToGames(boxScores);
    return res.json(games);
  } catch (err) {
    console.error('Error fetching games by date:', err);
    res.status(500).send('Server Error');
  }
});

// Helper function to process box scores into game objects
function processBoxScoresToGames(boxScores) {
  const gameMap = {};
  
  // Group box scores by gameId
  boxScores.forEach(score => {
    if (!gameMap[score.gameId]) {
      // Initialize a new game object
      gameMap[score.gameId] = {
        gameId: score.gameId,
        gameStatus: 'Final',  // All past games are final
        gameStatusId: 3,
        gameDate: score.gameDate,
        homeTeam: {
          teamId: null,
          teamName: '',
          teamCity: '',
          teamTricode: '',
          score: 0,
          record: ''
        },
        awayTeam: {
          teamId: null,
          teamName: '',
          teamCity: '',
          teamTricode: '',
          score: 0,
          record: ''
        },
        period: 4,  // Final games have 4 periods (or more if OT)
        gameClock: '0:00',
        plays: []
      };
    }
    
    // Determine if this is a home or away player based on matchup
    const isHome = score.matchup && score.matchup.includes(' vs.');
    const teamType = isHome ? 'homeTeam' : 'awayTeam';
    
    // Only update team info if not already set
    if (!gameMap[score.gameId][teamType].teamTricode) {
      gameMap[score.gameId][teamType].teamId = score.teamId || null;
      gameMap[score.gameId][teamType].teamName = score.teamName || score.teamAbbr;
      gameMap[score.gameId][teamType].teamCity = score.teamCity || '';
      gameMap[score.gameId][teamType].teamTricode = score.teamAbbr || '';
      
      // If we know the final score from the score field in matchup
      if (score.teamScore) {
        gameMap[score.gameId][teamType].score = score.teamScore;
      }
    }
  });
  
  return Object.values(gameMap);
}

// @route   GET api/games/:gameId
// @desc    Get specific game details
// @access  Public
router.get('/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    // Get access to the MongoDB collections
    const db = mongoose.connection.db;
    const liveGamesCollection = db.collection('live_games');
    const boxScoresCollection = db.collection('player_box_scores');
    
    // First check if it's a live game
    const liveGame = await liveGamesCollection.findOne({ gameId });
    
    if (liveGame) {
      return res.json(liveGame);
    }
    
    // If not live, check completed games
    const boxScores = await boxScoresCollection.find({ gameId }).toArray();
    
    if (boxScores.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Convert box scores to a game object
    const games = processBoxScoresToGames(boxScores);
    
    if (games.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(games[0]);
  } catch (err) {
    console.error('Error fetching game details:', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/games/upcoming
// @desc    Get upcoming scheduled games
// @access  Public
router.get('/upcoming', async (req, res) => {
  try {
    const today = moment().format('MM/DD/YYYY');
    const nextDays = [];
    
    // Add the next 3 days in MM/DD/YYYY format
    for (let i = 1; i <= 3; i++) {
      nextDays.push(moment().add(i, 'days').format('MM/DD/YYYY'));
    }
    
    // Get access to the MongoDB collections
    const db = mongoose.connection.db;
    const scheduledGamesCollection = db.collection('scheduled_games');
    
    // Query for upcoming games
    const upcomingGames = await scheduledGamesCollection.find({
      gameDate: { $in: [today, ...nextDays] }
    }).toArray();
    
    // If no data in schedule collection, use data from the CSV file
    if (upcomingGames.length === 0) {
      try {
        // Attempt to fetch the schedule from our NBA schedule CSV
        await runPythonScript(['--schedule', 'upcoming']);
        
        // Try querying again
        const refreshedSchedule = await scheduledGamesCollection.find({
          gameDate: { $in: [today, ...nextDays] }
        }).toArray();
        
        return res.json(refreshedSchedule);
      } catch (error) {
        console.error('[GAMES-API] Error fetching upcoming schedule:', error);
        return res.json([]);
      }
    }
    
    res.json(upcomingGames);
  } catch (err) {
    console.error('Error fetching upcoming games:', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/games/:gameId/boxscores
// @desc    Get box scores for a specific game
// @access  Public
router.get('/:gameId/boxscores', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    // Get access to the MongoDB collection
    const db = mongoose.connection.db;
    const boxScoresCollection = db.collection('player_box_scores');
    
    // Query for box scores
    const boxScores = await boxScoresCollection.find({ gameId }).toArray();
    
    if (boxScores.length === 0) {
      return res.status(404).json({ error: 'Box scores not found' });
    }
    
    // Split into home and away teams
    const homeTeamStats = boxScores.filter(score => score.matchup.includes(' vs. '));
    const awayTeamStats = boxScores.filter(score => score.matchup.includes(' @ '));
    
    res.json({
      gameId,
      homeTeamStats,
      awayTeamStats
    });
  } catch (err) {
    console.error('Error fetching box scores:', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/games/update-player-stats
// @desc    Force update of player statistics for active games
// @access  Public
router.get('/update-player-stats', async (req, res) => {
  try {
    console.log('[GAMES-API] Forcing player stats update for live games...');
    
    // Run the Python script to update player box scores
    const scriptPath = path.join(__dirname, '../dataControl/playersBoxScores.py');
    const pythonProcess = spawn('python', [scriptPath, '--live']);
    
    let stdoutData = '';
    let stderrData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
    
    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error(`[GAMES-API] Player stats update failed with code ${code}`);
        console.error(`[GAMES-API] Error: ${stderrData}`);
        return res.status(500).json({ error: 'Failed to update player stats' });
      }
      
      // Also update the live games data to make sure it incorporates the new player data
      const liveGamesScript = path.join(__dirname, '../dataControl/liveGames.py');
      const liveGamesProcess = spawn('python', [liveGamesScript]);
      
      liveGamesProcess.on('close', async (liveCode) => {
        // Get the MongoDB connection
        const db = mongoose.connection.db;
        const liveGamesCollection = db.collection('live_games');
        
        // Get all live games after the update
        const liveGames = await liveGamesCollection.find({}).toArray();
        
        res.json({
          message: 'Player stats updated successfully',
          gamesUpdated: liveGames.length,
          stdout: stdoutData,
          liveGames: liveGames
        });
      });
    });
  } catch (err) {
    console.error('Error updating player stats:', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/games/update-box-scores
// @desc    Force update of box scores and player stats for live games
// @access  Public
router.get('/update-box-scores', async (req, res) => {
  try {
    console.log('[GAMES-API] Forcing box score & player stats update for live games...');
    
    // Step 1: Run the playersBoxScores.py script with --live flag to fetch fresh box scores
    const boxScoreScript = path.join(__dirname, '../dataControl/playersBoxScores.py');
    const boxScoreProcess = spawn('python', [boxScoreScript, '--live']);
    
    let stdoutData = '';
    let stderrData = '';
    
    boxScoreProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    boxScoreProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
    
    boxScoreProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error(`[GAMES-API] Box score update failed with code ${code}`);
        console.error(`[GAMES-API] Error: ${stderrData}`);
        return res.status(500).json({ error: 'Failed to update box scores' });
      }
      
      console.log('[GAMES-API] Box scores updated, now updating live games...');
      
      // Step 2: Run the liveGames.py script to incorporate the box score data
      const liveGamesScript = path.join(__dirname, '../dataControl/liveGames.py');
      const liveGamesProcess = spawn('python', [liveGamesScript]);
      
      let liveStdoutData = '';
      let liveStderrData = '';
      
      liveGamesProcess.stdout.on('data', (data) => {
        liveStdoutData += data.toString();
      });
      
      liveGamesProcess.stderr.on('data', (data) => {
        liveStderrData += data.toString();
      });
      
      liveGamesProcess.on('close', async (liveCode) => {
        if (liveCode !== 0) {
          console.error(`[GAMES-API] Live games update failed with code ${liveCode}`);
          console.error(`[GAMES-API] Error: ${liveStderrData}`);
          return res.status(500).json({ error: 'Failed to update live games with box score data' });
        }
        
        // Get the MongoDB connection
        const db = mongoose.connection.db;
        const liveGamesCollection = db.collection('live_games');
        const boxScoresCollection = db.collection('player_box_scores');
        
        // Get counts for reporting
        const liveGamesCount = await liveGamesCollection.countDocuments();
        const boxScoresCount = await boxScoresCollection.countDocuments();
        
        // Get all live games after the update to check player stats
        const liveGames = await liveGamesCollection.find({}).toArray();
        
        // Check if any games have player data
        let gamesWithPlayerData = 0;
        if (liveGames.length > 0) {
          gamesWithPlayerData = liveGames.filter(g => 
            (g.homePlayers && g.homePlayers.length > 0) || 
            (g.awayPlayers && g.awayPlayers.length > 0)
          ).length;
          
          // Log details of the first game
          const firstGame = liveGames[0];
          console.log(`[GAMES-API] First game ${firstGame.gameId} has ${firstGame.homePlayers?.length || 0} home players and ${firstGame.awayPlayers?.length || 0} away players`);
        }
        
        res.json({
          success: true,
          message: 'Box scores and live games updated successfully',
          liveGamesCount,
          boxScoresCount,
          gamesWithPlayerData,
          liveGamesOutput: liveStdoutData,
          boxScoresOutput: stdoutData
        });
      });
    });
  } catch (err) {
    console.error('Error updating box scores:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;