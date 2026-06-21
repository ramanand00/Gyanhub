// routes/AdminAuthRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // ← ADD THIS IMPORT
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { isAdmin, hasPermission } = require("../middleware/auth");

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is deactivated",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { userId: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get current admin
router.get("/me", isAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    res.json({
      success: true,
      admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Create first super admin (for initial setup)
router.post("/create-super-admin", async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    // Verify secret key
    if (secretKey !== process.env.SUPER_ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        message: "Invalid secret key",
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      role: "super_admin",
      permissions: {
        manageUsers: true,
        manageCourses: true,
        manageAdmins: true,
        viewAnalytics: true,
      },
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: "Super admin created successfully",
    });
  } catch (error) {
    console.error("Create super admin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Update admin permissions (super admin only)
router.put(
  "/:adminId/permissions",
  isAdmin,
  hasPermission("manageAdmins"),
  async (req, res) => {
    try {
      const { permissions } = req.body;
      const admin = await Admin.findById(req.params.adminId);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      // Prevent changing super admin permissions
      if (admin.role === "super_admin") {
        return res.status(403).json({
          success: false,
          message: "Cannot modify super admin permissions",
        });
      }

      admin.permissions = permissions;
      await admin.save();

      res.json({
        success: true,
        message: "Permissions updated successfully",
        admin: {
          id: admin._id,
          name: admin.name,
          permissions: admin.permissions,
        },
      });
    } catch (error) {
      console.error("Update permissions error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

module.exports = router;