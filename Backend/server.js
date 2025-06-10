const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const auctionRoutes = require('./routes/auction');
const playersRoutes = require('./routes/players');
const graphicsRoutes = require('./routes/graphics');
const googleAuthRoutes = require('./routes/googleAuth');
const boxScoresRoutes = require('./routes/boxScores');
const gamesRoutes = require('./routes/games');
const commodityRoutes = require('./routes/commodity');
const suggestionsRoutes = require('./routes/suggestions');
const mlbRoutes = require('./routes/mlb');
const leaderboardRoutes = require('./routes/leaderboard');
require('./scheduler');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:3000',
  'https://imperium-6msr.onrender.com',
  'https://imperium-blond.vercel.app',
  'https://adrenyline.com',
  'https://www.adrenyline.com'
];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/graphics', graphicsRoutes);
app.use('/api', googleAuthRoutes);
app.use('/api/boxScores', boxScoresRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/commodity', commodityRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/mlb', mlbRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
    })
    .catch((error) => console.error('MongoDB connection error:', error));
