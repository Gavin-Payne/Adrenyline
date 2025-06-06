const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const router = express.Router();
const moment = require('moment-timezone');
const verifyToken = require('../middleware/verifyToken');

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const lastClaimDate = user.lastDailyAllowance ? new Date(user.lastDailyAllowance) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyCollected = lastClaimDate && lastClaimDate.getDate() === today.getDate() && lastClaimDate.getMonth() === today.getMonth() && lastClaimDate.getFullYear() === today.getFullYear();
    res.json({ ...user._doc, dailyCollected });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/dailyAllowance', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const currentEastern = moment().tz("America/New_York");
    let threshold;
    if (currentEastern.hour() < 4) {
      threshold = moment(currentEastern).subtract(1, 'day').set({ hour: 4, minute: 0, second: 0, millisecond: 0 });
    } else {
      threshold = moment(currentEastern).set({ hour: 4, minute: 0, second: 0, millisecond: 0 });
    }
    if (user.lastDailyAllowance && moment(user.lastDailyAllowance).isAfter(threshold)) {
      return res.status(400).json({ message: 'The daily allowance has already been collected' });
    }
    const commonAllowance = 100;
    const premiumAllowance = 10;
    user.silver += commonAllowance;
    user.gold += premiumAllowance;
    user.lastDailyAllowance = new Date();
    await user.save();
    res.json({ message: 'Daily allowance collected', silver: user.silver, gold: user.gold });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/tutorialCompleted', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.tutorialCompleted = true;
    await user.save();
    res.json({ message: 'Tutorial marked as completed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
