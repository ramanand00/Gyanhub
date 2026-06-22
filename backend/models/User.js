// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    // Refresh Token
    refreshToken: {
      type: String,
    },
    refreshTokenExpires: {
      type: Date,
    },
    // Role and Creator fields
    role: {
      type: String,
      enum: ['user', 'creator', 'admin'],
      default: 'user',
    },
    isCreator: {
      type: Boolean,
      default: false,
    },
    creatorRequest: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: null,
      },
      requestedAt: Date,
      reviewedAt: Date,
      notes: String,
      expertise: String,
      experience: String,
      reason: String,
      portfolio: String,
    },

     followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    
    // Profile visibility
    isPublicProfile: {
      type: Boolean,
      default: true,
    },
    
    // Profile fields
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        field: { type: String, default: '' },
        startYear: { type: Number },
        endYear: { type: Number },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' },
      }
    ],
    socialLinks: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      youtube: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    skills: [String],
    interests: [String],
    // Creator stats
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalCourses: {
      type: Number,
      default: 0,
    },
    creatorRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    // Session Management
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);