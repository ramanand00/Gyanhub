// routes/UserRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");
const NotificationHelpers = require("../utils/notificationHelpers");


// Request to become a creator
router.post("/request-creator", authenticate, async (req, res) => {
  try {
    const { expertise, experience, reason, portfolio } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isCreator) {
      return res.status(400).json({
        success: false,
        message: "You are already a creator",
      });
    }

    // Check if there's a pending request
    if (user.creatorRequest?.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: "Your request is already pending approval",
      });
    }

    // Save the request with all form data
    user.creatorRequest = {
      status: 'pending',
      requestedAt: new Date(),
      expertise: expertise || '',
      experience: experience || '',
      reason: reason || '',
      portfolio: portfolio || '',
      // Clear any previous rejection notes
      notes: undefined,
      reviewedAt: undefined,
    };
    
    await user.save();

    console.log('✅ Creator request saved:', {
      userId: user._id,
      name: user.name,
      email: user.email,
      expertise: user.creatorRequest.expertise,
      experience: user.creatorRequest.experience,
      reason: user.creatorRequest.reason,
      portfolio: user.creatorRequest.portfolio,
    });

    res.status(200).json({
      success: true,
      message: "Creator request submitted successfully. Please wait for approval.",
      data: {
        expertise: user.creatorRequest.expertise,
        experience: user.creatorRequest.experience,
        reason: user.creatorRequest.reason,
        portfolio: user.creatorRequest.portfolio,
      }
    });
  } catch (error) {
    console.error("Request creator error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});


router.post("/request-creator", authenticate, async (req, res) => {
  try {
    const { expertise, experience, reason, portfolio } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isCreator) {
      return res.status(400).json({
        success: false,
        message: "You are already a creator",
      });
    }

    if (user.creatorRequest?.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: "Your request is already pending approval",
      });
    }

    user.creatorRequest = {
      status: 'pending',
      requestedAt: new Date(),
      expertise: expertise || '',
      experience: experience || '',
      reason: reason || '',
      portfolio: portfolio || '',
      notes: undefined,
      reviewedAt: undefined,
    };
    
    await user.save();

    // Send notification
    await NotificationHelpers.creatorRequestSubmitted(user._id, user.name);

    console.log('✅ Creator request saved:', {
      userId: user._id,
      name: user.name,
      email: user.email,
    });

    res.status(200).json({
      success: true,
      message: "Creator request submitted successfully. Please wait for approval.",
      data: {
        expertise: user.creatorRequest.expertise,
        experience: user.creatorRequest.experience,
        reason: user.creatorRequest.reason,
        portfolio: user.creatorRequest.portfolio,
      }
    });
  } catch (error) {
    console.error("Request creator error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});



// Check creator status
router.get("/creator-status", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('isCreator creatorRequest totalCourses totalStudents creatorRating');
    
    res.status(200).json({
      success: true,
      isCreator: user.isCreator,
      creatorRequest: user.creatorRequest,
      totalCourses: user.totalCourses || 0,
      totalStudents: user.totalStudents || 0,
      creatorRating: user.creatorRating || 0,
    });
  } catch (error) {
    console.error("Creator status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;