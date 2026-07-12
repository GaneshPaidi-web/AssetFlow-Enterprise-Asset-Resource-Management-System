exports.login = async (req, res) => {
  try {
    const { email } = req.body;
    // Simple simulated response matching the frontend UI credentials expectations
    res.status(200).json({
      token: 'mock-jwt-token',
      user: {
        name: 'Kristin Watson',
        email: email || 'kristin.watson@assetflow.com',
        role: 'System Administrator',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        site: 'San Francisco HQ'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
};

exports.signup = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Registration successful!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Password recovery email sent!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate password recovery' });
  }
};
