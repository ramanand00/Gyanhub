// routes/UserRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { authenticate, optionalAuth } = require("../middleware/auth");
const NotificationHelpers = require("../utils/notificationHelpers");

// ==================== GET USER PROFILE (CURRENT USER) ====================
router.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -otp -resetPasswordToken -resetPasswordExpires -refreshToken -refreshTokenExpires");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==================== GET USER PROFILE BY ID (PUBLIC) ====================
router.get("/profile/:userId", optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId)
      .select('-password -otp -resetPasswordToken -resetPasswordExpires -refreshToken -refreshTokenExpires')
      .populate('followers', 'name profilePicture')
      .populate('following', 'name profilePicture');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if profile is private and viewer is not the owner
    if (!user.isPublicProfile && req.user?._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "This profile is private",
      });
    }

    // Get user's courses
    let courses = [];
    let enrollments = [];
    let totalStudents = 0;

    if (user.isCreator || user.role === 'creator') {
      courses = await Course.find({ 
        instructor: userId,
        isPublished: true,
        status: 'published'
      }).select('title thumbnail price rating enrollments totalLessons');
      
      const courseIds = courses.map(c => c._id);
      const enrollmentStats = await Enrollment.aggregate([
        { $match: { course: { $in: courseIds } } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      totalStudents = enrollmentStats[0]?.count || 0;
    }

    // Check if current user is following this profile
    let isFollowing = false;
    if (req.user) {
      const currentUser = await User.findById(req.user._id);
      isFollowing = currentUser.following?.includes(userId) || false;
    }

    // Get user's enrolled courses (only for the profile owner)
    if (req.user && req.user._id.toString() === userId) {
      enrollments = await Enrollment.find({ 
        user: userId,
        paymentStatus: { $in: ['free', 'completed'] }
      })
      .populate('course', 'title thumbnail price')
      .sort({ createdAt: -1 })
      .limit(5);
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        profilePicture: user.profilePicture,
        bio: user.bio,
        address: user.address,
        education: user.education,
        socialLinks: user.socialLinks,
        skills: user.skills,
        interests: user.interests,
        isCreator: user.isCreator,
        role: user.role,
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
        totalCourses: user.totalCourses || 0,
        totalStudents: totalStudents || 0,
        creatorRating: user.creatorRating || 0,
        createdAt: user.createdAt,
        isFollowing,
        isPublicProfile: user.isPublicProfile,
        courses: courses || [],
        recentEnrollments: enrollments || [],
        followers: user.followers,
        following: user.following,
      }
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==================== REQUEST TO BECOME A CREATOR ====================
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

// ==================== CHECK CREATOR STATUS ====================
router.get("/creator-status", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('isCreator creatorRequest totalCourses totalStudents creatorRating');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      isCreator: user.isCreator || false,
      creatorRequest: user.creatorRequest || null,
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

// ==================== FOLLOW A USER ====================
router.post("/follow/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentUser = await User.findById(req.user._id);
    
    if (currentUser.following?.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user",
      });
    }

    currentUser.following.push(userId);
    currentUser.followingCount = (currentUser.followingCount || 0) + 1;
    await currentUser.save();

    targetUser.followers.push(req.user._id);
    targetUser.followersCount = (targetUser.followersCount || 0) + 1;
    await targetUser.save();

    await NotificationHelpers.followNotification(
      targetUser._id,
      currentUser.name,
      currentUser._id
    );

    res.status(200).json({
      success: true,
      message: `You are now following ${targetUser.name}`,
      following: true,
      followersCount: targetUser.followersCount,
    });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==================== UNFOLLOW A USER ====================
router.post("/unfollow/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentUser = await User.findById(req.user._id);
    
    if (!currentUser.following?.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      });
    }

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userId
    );
    currentUser.followingCount = Math.max(0, (currentUser.followingCount || 0) - 1);
    await currentUser.save();

    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== req.user._id.toString()
    );
    targetUser.followersCount = Math.max(0, (targetUser.followersCount || 0) - 1);
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `You have unfollowed ${targetUser.name}`,
      following: false,
      followersCount: targetUser.followersCount,
    });
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==================== GET FOLLOWERS LIST ====================
router.get("/followers/:userId", optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const followers = await User.find({
      _id: { $in: user.followers || [] }
    })
    .select('name profilePicture bio isCreator totalCourses followersCount')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    const total = user.followers?.length || 0;

    res.status(200).json({
      success: true,
      followers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      }
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==================== GET FOLLOWING LIST ====================
router.get("/following/:userId", optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const following = await User.find({
      _id: { $in: user.following || [] }
    })
    .select('name profilePicture bio isCreator totalCourses followersCount')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    const total = user.following?.length || 0;

    res.status(200).json({
      success: true,
      following,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      }
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;