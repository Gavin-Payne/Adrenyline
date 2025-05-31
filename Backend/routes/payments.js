const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

router.post('/create-payment-intent', authMiddleware, async (req, res) => {
  const { packageId, amount, currencyType, price } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: 'usd',
      metadata: {
        packageId,
        currencyType,
        userId: req.user.id,
        virtualCurrencyAmount: amount
      }
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: 'Failed to initiate payment process' });
  }
});

router.post('/confirm-payment', authMiddleware, async (req, res) => {
  const { paymentIntentId } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status === 'succeeded') {
      const { userId, currencyType, virtualCurrencyAmount } = paymentIntent.metadata;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (currencyType === 'silver') {
        user.silver += parseInt(virtualCurrencyAmount);
      } else if (currencyType === 'gold') {
        user.gold += parseInt(virtualCurrencyAmount);
      }
      await user.save();
      res.json({
        success: true,
        amount: parseInt(virtualCurrencyAmount),
        message: `Successfully purchased ${virtualCurrencyAmount} ${currencyType === 'silver' ? 'SBM' : 'ALU'}`
      });
    } else {
      res.status(400).json({ message: 'Payment was not successful' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment confirmation' });
  }
});

module.exports = router;