// routes/AuthRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const TokenService = require("../services/tokenService");
const { authenticate, optionalAuth } = require("../middleware/auth");
const { generateOTP, generateOTPExpiry } = require("../services/otpService");
const { sendOTPEmail } = require("../services/emailService");
const NotificationHelpers = require("../utils/notificationHelpers");

// Register - Step 1: Send OTP
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, mobileNumber } = req.body;

    // Validate input
    if (!name || !email || !password || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "User already exists. Please login.",
        });
      } else {
        // Update existing unverified user
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        user.name = name;
        user.password = hashedPassword;
        user.mobileNumber = mobileNumber;
        user.otp = {
          code: otp,
          expiresAt: generateOTPExpiry(),
        };
        await user.save();
        
        await sendOTPEmail(email, otp, name);
        
        return res.status(200).json({
          success: true,
          message: "OTP sent to your email. Please verify.",
          email: email,
        });
      }
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    user = new User({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      otp: {
        code: otp,
        expiresAt: generateOTPExpiry(),
      },
    });

    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    // Send welcome notification
    await NotificationHelpers.welcome(user._id, user.name);

    res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify.",
      email: email,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check if OTP matches and not expired
    if (user.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify user and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    // Send email verified notification
    await NotificationHelpers.emailVerified(user._id, user.name);

    // Generate tokens
    const tokens = await TokenService.generateTokens(user);

    // Remove sensitive data
    const userData = user.toObject();
    delete userData.password;
    delete userData.otp;
    delete userData.refreshToken;
    delete userData.refreshTokenExpires;

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userData,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email first.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account deactivated. Please contact support.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Generate tokens
    const tokens = await TokenService.generateTokens(user);

    // Remove sensitive data
    const userData = user.toObject();
    delete userData.password;
    delete userData.otp;
    delete userData.refreshToken;
    delete userData.refreshTokenExpires;

    res.status(200).json({
      success: true,
      message: "Login successful!",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

// Refresh Token
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token required",
        code: "REFRESH_TOKEN_REQUIRED"
      });
    }

    const result = await TokenService.refreshAccessToken(refreshToken);
    
    res.status(200).json({
      success: true,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    
    if (error.message === 'INVALID_OR_EXPIRED_REFRESH_TOKEN') {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token. Please login again.",
        code: "INVALID_REFRESH_TOKEN"
      });
    }
    
    res.status(401).json({
      success: false,
      message: "Failed to refresh token",
      code: "REFRESH_FAILED"
    });
  }
});

// Logout
router.post("/logout", authenticate, async (req, res) => {
  try {
    await TokenService.revokeRefreshToken(req.user._id);
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Logout from all devices
router.post("/logout-all", authenticate, async (req, res) => {
  try {
    await TokenService.revokeAllSessions(req.user._id);
    
    res.status(200).json({
      success: true,
      message: "Logged out from all devices",
    });
  } catch (error) {
    console.error("Logout all error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get current user
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -otp -refreshToken -refreshTokenExpires");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Check token validity
router.get("/check-token", authenticate, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Token is valid",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    }
  });
});

module.exports = router;