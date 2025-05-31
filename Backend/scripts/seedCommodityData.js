const path = require('path');
// Load environment variables from the correct .env file path
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const fetch = require('node-fetch');
const CommodityPrice = require('../models/CommodityPrice');

async function fetchPrice(commodity) {
  try {
    console.log(`Fetching ${commodity} price...`);
    console.log(`Using API key: ${process.env.API_NINJAS_API_KEY ? '✅ (key found)' : '❌ (key missing)'}`);
    
    const response = await fetch(`https://api.api-ninjas.com/v1/commodityprice?name=${commodity}`, {
      headers: { 
        "X-Api-Key": process.env.API_NINJAS_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`API returned:`, result);
    
    if (!result || !result.price) {
      throw new Error('Invalid API response');
    }
    
    return result.price;
  } catch (error) {
    console.error(`Error fetching ${commodity} data:`, error);
    throw error;
  }
}

async function seedData() {
  try {
    // Log environment variables for debugging
    console.log('ENV vars check:');
    console.log('- MONGO_URI:', process.env.MONGO_URI ? '✅ (found)' : '❌ (missing)');
    console.log('- API_NINJAS_API_KEY:', process.env.API_NINJAS_API_KEY ? '✅ (found)' : '❌ (missing)');
    
    // Make sure we have the MongoDB URI
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Check existing data
    const soybeanCount = await CommodityPrice.countDocuments({ commodity: 'soybean_meal' });
    const aluminumCount = await CommodityPrice.countDocuments({ commodity: 'aluminum' });
    
    console.log(`Found ${soybeanCount} soybean records, ${aluminumCount} aluminum records`);
    
    // Add initial prices if none exist
    if (soybeanCount === 0) {
      console.log('Adding initial soybean_meal price...');
      try {
        const price = await fetchPrice('soybean_meal');
        const newPrice = new CommodityPrice({
          commodity: 'soybean_meal',
          price,
          timestamp: new Date()
        });
        await newPrice.save();
        console.log(`Saved soybean_meal price: ${price}`);
      } catch (error) {
        console.error('Failed to fetch soybean_meal price:', error);
      }
    }
    
    if (aluminumCount === 0) {
      console.log('Adding initial aluminum price...');
      try {
        const price = await fetchPrice('aluminum');
        const newPrice = new CommodityPrice({
          commodity: 'aluminum',
          price,
          timestamp: new Date()
        });
        await newPrice.save();
        console.log(`Saved aluminum price: ${price}`);
      } catch (error) {
        console.error('Failed to fetch aluminum price:', error);
      }
    }
    
  } catch (error) {
    console.error('Error in seed script:', error);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}

function debugEnv() {
  console.log('Current working directory:', process.cwd());
  console.log('Script directory:', __dirname);
  console.log('.env file expected at:', path.join(__dirname, '../.env'));
}

debugEnv();
seedData();