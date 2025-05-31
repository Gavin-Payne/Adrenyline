const express = require('express');
const fetch = require('node-fetch');
const CommodityPrice = require('../models/CommodityPrice');
const router = express.Router();

const API_ENDPOINTS = {
  soybean_meal: "https://api.api-ninjas.com/v1/commodityprice?name=soybean_meal",
  aluminum: "https://api.api-ninjas.com/v1/commodityprice?name=aluminum"
};

/**
 * Fetches commodity data from external API
 * @param {string} commodity - The commodity to fetch (soybean_meal or aluminum)
 * @returns {Promise<Object>} - The commodity price data
 */
async function fetchCommodityData(commodity) {
  try {
    if (!API_ENDPOINTS[commodity]) {
      throw new Error(`Invalid commodity: ${commodity}`);
    }

    const response = await fetch(API_ENDPOINTS[commodity], {
      headers: { "X-Api-Key": process.env.API_NINJAS_API_KEY }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();

    if (!result || !result.price) {
      throw new Error('Invalid API response');
    }

    return {
      price: result.price,
      timestamp: new Date()
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves historical price data for a commodity
 * @param {string} commodity - The commodity name
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} - Array of price records
 */
async function getHistoricalData(commodity, limit = 100) {
  return await CommodityPrice.find({ commodity }).sort({ timestamp: -1 }).limit(limit);
}

// Route to get the latest price + historical data for a commodity
router.get('/:commodity', async (req, res) => {
  try {
    const { commodity } = req.params;
    if (!['soybean_meal', 'aluminum'].includes(commodity)) {
      return res.status(400).json({ error: 'Invalid commodity. Supported: soybean_meal, aluminum' });
    }
    const lastRecord = await CommodityPrice.findOne({ commodity }).sort({ timestamp: -1 }).limit(1);
    let latestData;
    if (!lastRecord || Date.now() - lastRecord.timestamp > 10 * 60 * 1000) {
      try {
        const apiData = await fetchCommodityData(commodity);
        const newPrice = new CommodityPrice({
          commodity,
          price: apiData.price
        });
        await newPrice.save();
        const count = await CommodityPrice.countDocuments({ commodity });
        if (count > 100) {
          const oldestRecord = await CommodityPrice.findOne({ commodity }).sort({ timestamp: 1 }).limit(1);
          if (oldestRecord) await oldestRecord.remove();
        }
        latestData = apiData;
      } catch (apiErr) {
        latestData = lastRecord;
      }
    } else {
      latestData = lastRecord;
    }
    const history = await getHistoricalData(commodity, 100);
    res.json({ latest: latestData, history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch commodity data' });
  }
});

module.exports = router;