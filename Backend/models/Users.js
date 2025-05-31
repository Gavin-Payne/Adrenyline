const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true 
  },
  password: { 
    type: String,
  },
  silver: { 
    type: Number, 
    default: 1000 
  },
  gold: { 
    type: Number, 
    default: 100
  },
  transactions: { 
    type: Number, 
    default: 0 
  },
  winRate: { 
    type: Number, 
    default: 0 
  },
  winnings: { 
    type: Number, 
    default: 0 
  },
  lastDailyAllowance: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Add method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
