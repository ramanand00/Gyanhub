// routes/TestRoutes.js
const express = require('express');
const router = express.Router();
const { sendOTPEmail } = require('../services/emailService');
const { generateOTP } = require('../services/otpService');

router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const otp = generateOTP();
    await sendOTPEmail(email, otp, 'Test User');
    
    res.json({
      success: true,
      message: 'Test email sent successfully!',
      // Only include OTP in development for testing
      ...(process.env.NODE_ENV !== 'production' && { otp })
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email'
    });
  }
});

module.exports = router;