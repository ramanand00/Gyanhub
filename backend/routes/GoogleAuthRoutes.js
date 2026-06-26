// routes/GoogleAuthRoutes.js
const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Initialize Google OAuth client
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

    // Find or create user
    let user = await User.findOne({ googleId });
    
    if (!user) {
      // Check if user exists with this email (from regular registration)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = googleId;
        existingUser.isVerified = true;
        existingUser.picture = picture || existingUser.picture;
        existingUser.profilePicture = picture || existingUser.profilePicture;
        await existingUser.save();
        user = existingUser;
        console.log(`🔗 Google account linked to existing user: ${email}`);
      } else {
        // Create new user
        user = new User({
          googleId,
          email,
          name,
          picture: picture || '',
          profilePicture: picture || '',
          isVerified: true,
          isActive: true,
          // Password and mobileNumber will be undefined (not required for Google users)
        });
        await user.save();
        console.log(`🆕 New user created via Google: ${email}`);
      }
    } else {
      // Update last login and picture
      user.lastLogin = new Date();
      user.picture = picture || user.picture;
      user.profilePicture = picture || user.profilePicture;
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save();
      console.log(`👤 Existing user logged in via Google: ${email}`);
    }

    // Create JWT token
    const jwtToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        isCreator: user.isCreator || false,
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

    // Remove sensitive data
    const userData = user.toObject();
    delete userData.password;
    delete userData.otp;
    delete userData.refreshToken;
    delete userData.refreshTokenExpires;

    res.json({
      success: true,
      message: 'Google login successful',
      user: userData,
      token: jwtToken,
    });
  } catch (error) {
    console.error('❌ Google auth error:', error);
    
    let errorMessage = 'Authentication failed';
    if (error.name === 'ValidationError') {
      errorMessage = 'User data validation failed: ' + Object.values(error.errors).map(e => e.message).join(', ');
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
    const user = await User.findById(decoded.userId)
      .select('-password -otp -refreshToken -refreshTokenExpires');
    
    if (!user || !user.isActive) {
      return res.json({ authenticated: false });
    }

    res.json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture || user.profilePicture,
        isCreator: user.isCreator || false,
        role: user.role || 'user',
        isVerified: user.isVerified || false,
      },
    });
  } catch (error) {
    console.error('Auth status error:', error);
    res.json({ authenticated: false });
  }
});

module.exports = router;