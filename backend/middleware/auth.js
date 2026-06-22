// middleware/auth.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const TokenService = require("../services/tokenService");

// General Authentication
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
        code: "NO_TOKEN"
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
        code: "INVALID_TOKEN_FORMAT"
      });
    }

    let decoded;
    try {
      decoded = TokenService.verifyAccessToken(token);
    } catch (error) {
      if (error.message === 'ACCESS_TOKEN_EXPIRED') {
        return res.status(401).json({
          success: false,
          message: "Access token expired",
          code: "ACCESS_TOKEN_EXPIRED",
          needsRefresh: true
        });
      }
      if (error.message === 'INVALID_ACCESS_TOKEN') {
        return res.status(401).json({
          success: false,
          message: "Invalid access token",
          code: "INVALID_ACCESS_TOKEN"
        });
      }
      throw error;
    }
    
    // Try to find user in User model first
    let user = await User.findById(decoded.userId);
    
    // If not found, try Admin model
    if (!user) {
      user = await Admin.findById(decoded.userId);
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account deactivated",
        code: "ACCOUNT_DEACTIVATED"
      });
    }

    req.user = user;
    req.userType = user.role ? "admin" : "user";
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      code: "AUTH_FAILED"
    });
  }
};

// Admin Authentication
const isAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
        code: "NO_TOKEN"
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
        code: "INVALID_TOKEN_FORMAT"
      });
    }

    let decoded;
    try {
      decoded = TokenService.verifyAccessToken(token);
    } catch (error) {
      if (error.message === 'ACCESS_TOKEN_EXPIRED') {
        return res.status(401).json({
          success: false,
          message: "Access token expired",
          code: "ACCESS_TOKEN_EXPIRED",
          needsRefresh: true
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        code: "INVALID_TOKEN"
      });
    }

    const admin = await Admin.findById(decoded.userId);
    
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
        code: "ADMIN_ONLY"
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is deactivated",
        code: "ADMIN_DEACTIVATED"
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      code: "AUTH_FAILED"
    });
  }
};

// Check specific permissions
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (req.admin && req.admin.permissions && req.admin.permissions[permission]) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: `Access denied. Requires ${permission} permission`,
        code: "PERMISSION_DENIED"
      });
    }
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (token) {
        try {
          const decoded = TokenService.verifyAccessToken(token);
          const user = await User.findById(decoded.userId);
          if (user && user.isActive !== false) {
            req.user = user;
          }
        } catch (error) {
          // Ignore token errors for optional auth
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { authenticate, isAdmin, hasPermission, optionalAuth };