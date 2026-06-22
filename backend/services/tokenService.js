// services/tokenService.js
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

class TokenService {
  // Generate Access Token (short-lived)
  static generateAccessToken(user) {
    return jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        name: user.name,
        role: user.role || 'user',
        isCreator: user.isCreator || false,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' } // 15 minutes
    );
  }

  // Generate Refresh Token (long-lived)
  static generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
  }

  // Generate both tokens
  static async generateTokens(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken();
    
    // Set refresh token expiry (7 days)
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = refreshTokenExpires;
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    return {
      accessToken,
      refreshToken,
      refreshTokenExpires,
    };
  }

  // Verify Access Token
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('ACCESS_TOKEN_EXPIRED');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('INVALID_ACCESS_TOKEN');
      }
      throw error;
    }
  }

  // Verify Refresh Token
  static async verifyRefreshToken(userId, refreshToken) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new Error('USER_DEACTIVATED');
    }

    if (user.refreshToken !== refreshToken) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    if (user.refreshTokenExpires < new Date()) {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }

    return user;
  }

  // Refresh Access Token
  static async refreshAccessToken(refreshToken) {
    // Find user by refresh token
    const user = await User.findOne({ 
      refreshToken: refreshToken,
      refreshTokenExpires: { $gt: new Date() },
      isActive: true,
    });

    if (!user) {
      throw new Error('INVALID_OR_EXPIRED_REFRESH_TOKEN');
    }

    // Generate new access token
    const newAccessToken = this.generateAccessToken(user);
    
    return {
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isCreator: user.isCreator,
        profilePicture: user.profilePicture,
      }
    };
  }

  // Revoke Refresh Token (Logout)
  static async revokeRefreshToken(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    user.refreshToken = null;
    user.refreshTokenExpires = null;
    await user.save();
    
    return true;
  }

  // Revoke all sessions (for security)
  static async revokeAllSessions(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    user.refreshToken = null;
    user.refreshTokenExpires = null;
    await user.save();
    
    return true;
  }

  // Check if token is expired
  static isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded) return true;
      const expiry = decoded.exp * 1000;
      return Date.now() >= expiry;
    } catch (error) {
      return true;
    }
  }

  // Get token expiry time
  static getTokenExpiry(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded) return null;
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  // Get remaining time for token
  static getTokenRemainingTime(token) {
    const expiry = this.getTokenExpiry(token);
    if (!expiry) return 0;
    return expiry.getTime() - Date.now();
  }

  // Clean expired refresh tokens (should run as a cron job)
  static async cleanExpiredRefreshTokens() {
    const result = await User.updateMany(
      { 
        refreshTokenExpires: { $lt: new Date() },
        refreshToken: { $ne: null }
      },
      { 
        $set: { 
          refreshToken: null,
          refreshTokenExpires: null 
        } 
      }
    );
    return result;
  }
}

module.exports = TokenService;