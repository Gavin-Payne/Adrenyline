const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  game: String,
  player: String,
  date: Date,
  gameDate: Date, // The actual date of the game this auction is for
  condition: String,
  value: Number,
  metric: String,
  duration: Number,
  betSize: Number,
  betType: String,
  multiplier: Number,
  expirationTime: Date,
  sport: String, 
  sportCategory: String,
  soldTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  refunded: { type: Boolean, default: false },
  // Fields for completed auctions
  completed: { type: Boolean, default: false },
  completedAt: Date,
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  actualValue: Number, // The actual value the player achieved
  totalPot: Number, // Total amount awarded to winner
  // MLB doubleheader support
  gameNumber: { type: Number, default: null } // 1 for game 1, 2 for game 2, null if not specified
});

module.exports = mongoose.model('Auction', auctionSchema);