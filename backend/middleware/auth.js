// middleware/auth.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");

// General Authentication
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
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
      });
    }

    req.user = user;
    req.userType = user.role ? "admin" : "user";
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// Admin Authentication
const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.userId);
    
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is deactivated",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
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
      });
    }
  };
};

module.exports = { authenticate, isAdmin, hasPermission };