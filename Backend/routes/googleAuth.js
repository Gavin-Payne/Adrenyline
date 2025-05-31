const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

router.post('/google-signin/check', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/google-signin', async (req, res) => {
  try {
    const { credential, username } = req.body;
    const decoded = jwt.decode(credential);
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    let user = await User.findOne({ email: decoded.email });
    if (user) {
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({ token });
    }
    if (!username) {
      return res.status(400).json({ message: 'Username required for new accounts' });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'username_taken' });
    }
    user = new User({
      username,
      email: decoded.email,
      silver: 1000,
      gold: 1000
    });
    await user.save();
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;