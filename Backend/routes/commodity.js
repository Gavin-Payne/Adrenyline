const express = require('express');
const router = express.Router();
const CommodityPrice = require('../models/CommodityPrice');

// Get latest prices for all commodities
router.get('/latest', async (req, res) => {
  try {
    const soybean = await CommodityPrice.findOne({ commodity: 'soybean_meal' }).sort({ timestamp: -1 }).limit(1);
    const aluminum = await CommodityPrice.findOne({ commodity: 'aluminum' }).sort({ timestamp: -1 }).limit(1);
    res.json({
      success: true,
      prices: {
        SBM: soybean ? soybean.price : 300,
        ALU: aluminum ? aluminum.price : 2300,
      },
      updated: Math.max(
        soybean ? new Date(soybean.timestamp).getTime() : 0,
        aluminum ? new Date(aluminum.timestamp).getTime() : 0
      )
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch latest commodity prices' });
  }
});

module.exports = router;