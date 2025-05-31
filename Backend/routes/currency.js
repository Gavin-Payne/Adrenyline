router.post('/purchase', authMiddleware, async (req, res) => {
  try {
    const { packageId, amount, currencyType, price } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (currencyType === 'silver') {
      user.silver += amount;
    } else if (currencyType === 'gold') {
      user.gold += amount;
    }
    await user.save();
    return res.json({
      success: true,
      amount: amount,
      message: `Successfully purchased ${amount} ${currencyType}`
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error processing currency purchase' });
  }
});