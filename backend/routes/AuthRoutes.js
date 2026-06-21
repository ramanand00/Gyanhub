// routes/AuthRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const { generateOTP, generateOTPExpiry } = require("../services/otpService");
const { sendOTPEmail } = require("../services/emailService");

// Register - Step 1: Send OTP
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, mobileNumber } = req.body;

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
        
        // Send OTP email
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

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified.",
      });
    }

    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: generateOTPExpiry(),
    };
    await user.save();

    await sendOTPEmail(email, otp, user.name);

    res.status(200).json({
      success: true,
      message: "New OTP sent to your email.",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password -otp");
    
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
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
});

module.exports = router;