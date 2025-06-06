const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/Users');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
if (!JWT_SECRET) {
  console.error('WARNING: JWT_SECRET is not set in environment variables!');
}

// Token blacklist set
const tokenBlacklist = new Set();

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error in /signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post(
    '/signin',
    [
      body('username').isString().notEmpty().withMessage('Username is required'),
      body('password').isString().notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { username, password } = req.body;
  
      try {
        const user = await User.findOne({ username });
        if (!user) {
          console.log(`Sign-in failed: No user found for username: ${username}`);
          return res.status(401).json({ message: 'Invalid credentials' });
        }
  
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          console.log(`Sign-in failed for username: ${username}`);
          return res.status(401).json({ message: 'Invalid credentials' });
        }
  
        const token = jwt.sign(
          { id: user._id },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
  
        console.log(`Sign-in successful for username: ${username}`);
        res.status(200).json({ token, message: 'Signed in successfully' });
      } catch (error) {
        console.error('Error in /signin:', error);
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  );

router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: 'Username/email and password are required' });
    }

    const user = await User.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Check if user already exists (by username or email)
    const existingUser = await User.findOne({
      $or: [
        { username },
        { email }
      ]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      silver: 1000, 
      gold: 100
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    tokenBlacklist.add(token);
  }
  
  res.json({ message: 'Logged out successfully' });
});

router.post('/google-signin', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        username: name.replace(/\s+/g, '') + Math.floor(Math.random() * 1000), // Generate username from name
        email,
        googleId,
        password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10), // Random password
        silver: 1000,
        gold: 100
      });
      
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token });
    
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

router.post('/google-onboarding', async (req, res) => {
  try {
    const { credential, username, password } = req.body;
    if (!credential || !username) {
      return res.status(400).json({ message: 'Google credential and username are required' });
    }
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, sub: googleId } = payload;
    // Check if username or email already exists
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ message: 'Username must be 3-20 characters, alphanumeric or underscores only.' });
    }
    const existingUser = await User.findOne({ $or: [ { username }, { email } ] });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    // Password complexity: at least 6 chars, 1 uppercase, 1 number (required)
    if (!password || password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters, include an uppercase letter and a number.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      googleId,
      password: hashedPassword,
      silver: 1000,
      gold: 100
    });
    await newUser.save();
    // Generate token
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, message: 'Account created via Google' });
  } catch (error) {
    console.error('Google onboarding error:', error);
    res.status(500).json({ message: 'Google onboarding failed' });
  }
});
router.tokenBlacklist = tokenBlacklist;
module.exports = router;