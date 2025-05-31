const User = require('../models/Users');

const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-username -password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUserData };
