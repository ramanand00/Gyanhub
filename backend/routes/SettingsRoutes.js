// routes/SettingsRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");
const cloudinary = require("../config/cloudinary");

// Get user profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -otp -resetPasswordToken -resetPasswordExpires");
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

// Update profile with all fields
router.put("/update-profile", authenticate, async (req, res) => {
  try {
    const { 
      name, 
      mobileNumber, 
      bio, 
      address, 
      socialLinks, 
      education, 
      skills, 
      interests,
      profilePicture 
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Handle profile picture upload to Cloudinary
    let profilePictureUrl = user.profilePicture;
    if (profilePicture && profilePicture !== user.profilePicture) {
      try {
        // If it's a base64 image (starts with data:image)
        if (profilePicture.startsWith('data:image')) {
          const uploadResponse = await cloudinary.uploader.upload(profilePicture, {
            folder: 'profile_pictures',
            width: 500,
            height: 500,
            crop: 'limit',
            quality: 'auto',
          });
          profilePictureUrl = uploadResponse.secure_url;
        } else {
          // If it's already a URL
          profilePictureUrl = profilePicture;
        }
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        // If upload fails, keep existing picture
        profilePictureUrl = user.profilePicture;
      }
    }

    // Update basic info
    if (name) user.name = name;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (bio !== undefined) user.bio = bio;
    if (profilePictureUrl) user.profilePicture = profilePictureUrl;

    // Update address
    if (address) {
      user.address = {
        street: address.street || user.address?.street || '',
        city: address.city || user.address?.city || '',
        state: address.state || user.address?.state || '',
        country: address.country || user.address?.country || '',
        pincode: address.pincode || user.address?.pincode || '',
      };
    }

    // Update social links
    if (socialLinks) {
      user.socialLinks = {
        linkedin: socialLinks.linkedin || user.socialLinks?.linkedin || '',
        github: socialLinks.github || user.socialLinks?.github || '',
        twitter: socialLinks.twitter || user.socialLinks?.twitter || '',
        instagram: socialLinks.instagram || user.socialLinks?.instagram || '',
        facebook: socialLinks.facebook || user.socialLinks?.facebook || '',
        youtube: socialLinks.youtube || user.socialLinks?.youtube || '',
        website: socialLinks.website || user.socialLinks?.website || '',
      };
    }

    // Update education
    if (education !== undefined) {
      user.education = education;
    }

    // Update skills
    if (skills !== undefined) {
      user.skills = skills;
    }

    // Update interests
    if (interests !== undefined) {
      user.interests = interests;
    }

    await user.save();

    // Return updated user without sensitive data
    const updatedUser = user.toObject();
    delete updatedUser.password;
    delete updatedUser.otp;
    delete updatedUser.resetPasswordToken;
    delete updatedUser.resetPasswordExpires;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

// Update password (keep existing)
router.put("/update-password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

module.exports = router;