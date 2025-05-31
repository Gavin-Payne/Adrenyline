const mongoose = require('mongoose');

const CommodityPriceSchema = new mongoose.Schema({
  commodity: {
    type: String,
    required: true,
    enum: ['soybeans', 'soybean_meal', 'aluminum', 'wheat', 'corn', 'gold', 'silver'] // Added soybean_meal
  },
  price: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for faster lookups
CommodityPriceSchema.index({ commodity: 1, timestamp: -1 });

module.exports = mongoose.model('CommodityPrice', CommodityPriceSchema);