const express = require('express');
const router = express.Router();
const User = require('../models/Users');

router.get('/sbm', async (req, res) => {
  try {
    const users = await User.find().sort({ silver: -1 }).limit(100).select('username silver');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/alu', async (req, res) => {
  try {
    const users = await User.find().sort({ gold: -1 }).limit(100).select('username gold');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;