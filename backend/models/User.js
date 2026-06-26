// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ===== BASIC USER INFO =====
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
      required: function() {
        // Password is required only if user doesn't have googleId
        return !this.googleId;
      },
    },
    mobileNumber: {
      type: String,
      required: function() {
        // Mobile number is required only if user doesn't have googleId
        return !this.googleId;
      },
    },
    
    // ===== GOOGLE AUTH FIELDS (NEW) =====
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined values for non-Google users
      index: true,
    },
    picture: {
      type: String,
      default: null,
    },

    // ===== EMAIL VERIFICATION =====
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },

    // ===== PASSWORD RESET =====
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },

    // ===== TOKEN MANAGEMENT =====
    refreshToken: {
      type: String,
    },
    refreshTokenExpires: {
      type: Date,
    },

    // ===== ROLE & CREATOR =====
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

    // ===== FOLLOW SYSTEM =====
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

    // ===== PROFILE =====
    isPublicProfile: {
      type: Boolean,
      default: true,
    },
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

    // ===== CREATOR STATS =====
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

    // ===== SESSION MANAGEMENT =====
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

// ===== INDEXES FOR PERFORMANCE =====
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ isCreator: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// ===== VIRTUAL PROPERTIES =====
userSchema.virtual('isGoogleUser').get(function() {
  return !!this.googleId;
});

userSchema.virtual('hasPassword').get(function() {
  return !!this.password;
});

// ===== METHODS =====
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.otp;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.refreshToken;
  delete user.refreshTokenExpires;
  return user;
};

// ===== STATIC METHODS =====
userSchema.statics.findByGoogleId = function(googleId) {
  return this.findOne({ googleId });
};

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

userSchema.statics.findOrCreateGoogleUser = async function(googleData) {
  const { googleId, email, name, picture } = googleData;
  
  // Try to find by googleId first
  let user = await this.findOne({ googleId });
  
  if (user) {
    // Update existing user
    user.lastLogin = new Date();
    user.picture = picture || user.picture;
    user.profilePicture = picture || user.profilePicture;
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();
    return user;
  }
  
  // Try to find by email
  user = await this.findOne({ email });
  
  if (user) {
    // Link Google account to existing user
    user.googleId = googleId;
    user.isVerified = true;
    user.picture = picture || user.picture;
    user.profilePicture = picture || user.profilePicture;
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();
    return user;
  }
  
  // Create new user
  user = new this({
    googleId,
    email,
    name,
    picture: picture || '',
    profilePicture: picture || '',
    isVerified: true,
    isActive: true,
    password: undefined, // No password for Google users
    mobileNumber: undefined, // No mobile number for Google users
    lastLogin: new Date(),
    loginCount: 1,
  });
  
  await user.save();
  return user;
};

module.exports = mongoose.model("User", userSchema);