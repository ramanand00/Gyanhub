// routes/GoogleAuthRoutes.js
const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Google token is required'
      });
    }

    console.log('🔐 Verifying Google token...');

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    console.log(`✅ Google user verified: ${email}`);

    // Use the static method to find or create user
    const user = await User.findOrCreateGoogleUser({
      googleId,
      email,
      name,
      picture,
    });

    console.log(`👤 User: ${user.name} (${user.isGoogleUser ? 'Google' : 'Existing'})`);

    // Create JWT token
    const jwtToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        isCreator: user.isCreator || false,
        isGoogleUser: user.isGoogleUser,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send user data (password and sensitive fields are automatically removed by toJSON)
    res.json({
      success: true,
      message: 'Google login successful',
      user: user.toJSON(),
      token: jwtToken,
    });
  } catch (error) {
    console.error('❌ Google auth error:', error);
    
    let errorMessage = 'Authentication failed';
    if (error.name === 'ValidationError') {
      errorMessage = 'User data validation failed';
    } else if (error.message.includes('invalid')) {
      errorMessage = 'Invalid Google token';
    }
    
    res.status(401).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ 
    success: true,
    message: 'Logged out successfully' 
  });
});

// Check auth status
router.get('/status', async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.json({ authenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.json({ authenticated: false });
    }

    res.json({
      authenticated: true,
      user: user.toJSON(),
    });
  } catch (error) {
    res.json({ authenticated: false });
  }
});

module.exports = router;