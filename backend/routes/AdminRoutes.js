// routes/AdminRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // ← ADD THIS IMPORT
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Admin = require("../models/Admin");
const { isAdmin, hasPermission } = require("../middleware/auth");

// =============== DASHBOARD STATS ===============
router.get("/dashboard/stats", isAdmin, hasPermission("viewAnalytics"), async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalEnrollments, revenue] = await Promise.all([
      User.countDocuments({ isVerified: true }),
      Course.countDocuments({ status: "published" }),
      Enrollment.countDocuments(),
      Enrollment.aggregate([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    // Get monthly registration stats
    const monthlyRegistrations = await User.aggregate([
      {
        $match: {
          isVerified: true,
          createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email mobileNumber isVerified createdAt");

    // Get recent enrollments with user and course details
    const recentEnrollments = await Enrollment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .populate("course", "title thumbnail");

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue: revenue[0]?.total || 0,
        monthlyRegistrations,
        recentUsers,
        recentEnrollments,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// =============== USER MANAGEMENT ===============
// Get all users
router.get("/users", isAdmin, hasPermission("manageUsers"), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", filter = "" } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (filter === "verified") {
      query.isVerified = true;
    } else if (filter === "unverified") {
      query.isVerified = false;
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-password -otp");

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get single user
router.get("/users/:id", isAdmin, hasPermission("manageUsers"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -otp");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Update user
router.put("/users/:id", isAdmin, hasPermission("manageUsers"), async (req, res) => {
  try {
    const { name, mobileNumber, isVerified } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name || user.name;
    user.mobileNumber = mobileNumber || user.mobileNumber;
    if (isVerified !== undefined) {
      user.isVerified = isVerified;
    }

    await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      user: user.toObject({ versionKey: false, transform: (doc, ret) => {
        delete ret.password;
        delete ret.otp;
        return ret;
      }}),
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Delete user
router.delete("/users/:id", isAdmin, hasPermission("manageUsers"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();
    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// =============== COURSE MANAGEMENT ===============
// Get all courses
router.get("/courses", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "" } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("instructor", "name email");

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get single course
router.get("/courses/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      .populate("students.userId", "name email");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Create course
router.post("/courses", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const courseData = req.body;
    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Update course
router.put("/courses/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    Object.assign(course, req.body);
    await course.save();

    res.json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Delete course
router.delete("/courses/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await course.deleteOne();
    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// =============== ENROLLMENT MANAGEMENT ===============
// Get all enrollments
router.get("/enrollments", isAdmin, hasPermission("viewAnalytics"), async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "" } = req.query;
    const query = {};

    if (status) {
      query.paymentStatus = status;
    }

    const enrollments = await Enrollment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("user", "name email")
      .populate("course", "title thumbnail price");

    const total = await Enrollment.countDocuments(query);

    res.json({
      success: true,
      enrollments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get enrollments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// =============== ADMIN MANAGEMENT ===============
// Get all admins (super admin only)
router.get("/admins", isAdmin, hasPermission("manageAdmins"), async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error("Get admins error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Create admin (super admin only)
router.post("/admins", isAdmin, hasPermission("manageAdmins"), async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

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
      role: role || "admin",
      permissions: permissions || {
        manageUsers: true,
        manageCourses: true,
        manageAdmins: false,
        viewAnalytics: true,
      },
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: admin.toObject({ versionKey: false, transform: (doc, ret) => {
        delete ret.password;
        return ret;
      }}),
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Delete admin (super admin only)
router.delete("/admins/:id", isAdmin, hasPermission("manageAdmins"), async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete super admin",
      });
    }

    await admin.deleteOne();
    res.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;