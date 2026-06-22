// routes/AdminRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");
const Admin = require("../models/Admin");
const Notification = require("../models/Notification");
const { isAdmin, hasPermission } = require("../middleware/auth");
const { createNotification } = require("./NotificationRoutes");
const NotificationHelpers = require("../utils/notificationHelpers");


// =============== DASHBOARD STATS ===============
router.get("/dashboard/stats", isAdmin, hasPermission("viewAnalytics"), async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      revenue,
      pendingCreators,
      totalAdmins,
      totalLessons,
      completedCourses
    ] = await Promise.all([
      User.countDocuments({ isVerified: true }),
      Course.countDocuments({ status: "published" }),
      Enrollment.countDocuments(),
      Enrollment.aggregate([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      User.countDocuments({ 'creatorRequest.status': 'pending' }),
      Admin.countDocuments({ isActive: true }),
      Lesson.countDocuments(),
      Enrollment.countDocuments({ completed: true }),
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

    // Get monthly enrollment stats
    const monthlyEnrollments = await Enrollment.aggregate([
      {
        $match: {
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
      .select("name email mobileNumber isVerified createdAt profilePicture");

    // Get recent enrollments with user and course details
    const recentEnrollments = await Enrollment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email profilePicture")
      .populate("course", "title thumbnail");

    // Get top courses by enrollment
    const topCourses = await Course.find({ status: "published" })
      .sort({ enrollments: -1 })
      .limit(5)
      .select("title thumbnail enrollments price rating");

    // Get recent courses
    const recentCourses = await Course.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("instructor", "name email")
      .select("title thumbnail status price createdAt");

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue: revenue[0]?.total || 0,
        pendingCreators,
        totalAdmins,
        totalLessons,
        completedCourses,
        monthlyRegistrations,
        monthlyEnrollments,
        recentUsers,
        recentEnrollments,
        topCourses,
        recentCourses,
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

// =============== CREATOR MANAGEMENT ===============

// Get all creator requests (pending)
router.get("/admin/creator-requests", isAdmin, hasPermission("manageUsers"), async (req, res) => {
  try {
    const users = await User.find({
      'creatorRequest.status': 'pending'
    }).select('name email profilePicture bio creatorRequest createdAt');

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get creator requests error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get all creators
router.get("/admin/creators", isAdmin, hasPermission("manageUsers"), async (req, res) => {
  try {
    const users = await User.find({
      isCreator: true
    }).select('name email profilePicture bio totalCourses totalStudents creatorRating createdAt');

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get creators error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Approve creator request
router.put("/admin/approve-creator/:userId", isAdmin, hasPermission("manageUsers"), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isCreator) {
      return res.status(400).json({
        success: false,
        message: "User is already a creator",
      });
    }

    user.isCreator = true;
    user.role = 'creator';
    user.creatorRequest.status = 'approved';
    user.creatorRequest.reviewedAt = new Date();
    await user.save();

    // Send notification to user
    await createNotification(
      user._id,
      'creator_request_approved',
      '✅ Creator Status Approved',
      'Congratulations! Your creator request has been approved. You can now create and publish courses.',
      {},
      '/my-courses',
      '🎓'
    );

    res.status(200).json({
      success: true,
      message: "Creator request approved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isCreator: user.isCreator,
      },
    });
  } catch (error) {
    console.error("Approve creator error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Reject creator request
router.put("/admin/reject-creator/:userId", isAdmin, hasPermission("manageUsers"), async (req, res) => {
  try {
    const { notes } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.creatorRequest.status = 'rejected';
    user.creatorRequest.reviewedAt = new Date();
    user.creatorRequest.notes = notes || '';
    await user.save();

    // Send notification to user
    await createNotification(
      user._id,
      'creator_request_rejected',
      '❌ Creator Request Rejected',
      `Your creator request has been reviewed and rejected.${notes ? ` Reason: ${notes}` : ''}`,
      { reason: notes },
      '/settings',
      '❌'
    );

    res.status(200).json({
      success: true,
      message: "Creator request rejected",
    });
  } catch (error) {
    console.error("Reject creator error:", error);
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
    } else if (filter === "creators") {
      query.isCreator = true;
    } else if (filter === "users") {
      query.isCreator = false;
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-password -otp -resetPasswordToken -resetPasswordExpires");

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
      .select("-password -otp -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's enrollments
    const enrollments = await Enrollment.find({ user: user._id })
      .populate("course", "title thumbnail price")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      enrollments,
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
    const { name, mobileNumber, isVerified, isCreator } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) user.name = name;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isCreator !== undefined && isCreator !== user.isCreator) {
      user.isCreator = isCreator;
      user.role = isCreator ? 'creator' : 'user';
    }

    await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      user: user.toObject({ versionKey: false, transform: (doc, ret) => {
        delete ret.password;
        delete ret.otp;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
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

    // Delete user's enrollments
    await Enrollment.deleteMany({ user: user._id });
    
    // Delete user's courses if creator
    if (user.isCreator) {
      const courses = await Course.find({ instructor: user._id });
      for (const course of courses) {
        // Delete modules and lessons
        const modules = await Module.find({ courseId: course._id });
        for (const module of modules) {
          await Lesson.deleteMany({ moduleId: module._id });
          await module.deleteOne();
        }
        await course.deleteOne();
      }
    }

    // Delete notifications
    await Notification.deleteMany({ user: user._id });

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
    const { page = 1, limit = 10, search = "", status = "", category = "" } = req.query;
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

    if (category) {
      query.category = category;
    }

    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("instructor", "name email profilePicture");

    const total = await Course.countDocuments(query);

    // Get additional stats for each course
    const coursesWithStats = await Promise.all(courses.map(async (course) => {
      const courseObj = course.toObject();
      const enrollments = await Enrollment.countDocuments({ 
        course: course._id,
        paymentStatus: { $in: ['completed', 'free'] }
      });
      const completed = await Enrollment.countDocuments({ 
        course: course._id,
        completed: true 
      });
      const totalReviews = course.reviews?.length || 0;
      const avgRating = totalReviews > 0 
        ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0;
      
      courseObj.enrollmentCount = enrollments;
      courseObj.completedCount = completed;
      courseObj.averageRating = Math.round(avgRating * 10) / 10;
      courseObj.totalReviews = totalReviews;
      return courseObj;
    }));

    res.json({
      success: true,
      courses: coursesWithStats,
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
      .populate("instructor", "name email profilePicture bio")
      .populate({
        path: 'modules',
        populate: {
          path: 'lessons',
          populate: {
            path: 'quiz',
          },
        },
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Get enrollment stats
    const enrollments = await Enrollment.find({ course: course._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(20);

    const totalEnrollments = await Enrollment.countDocuments({ course: course._id });
    const completedEnrollments = await Enrollment.countDocuments({ 
      course: course._id,
      completed: true 
    });
    const revenue = await Enrollment.aggregate([
      { $match: { course: course._id, paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      success: true,
      course,
      stats: {
        totalEnrollments,
        completedEnrollments,
        revenue: revenue[0]?.total || 0,
        completionRate: totalEnrollments > 0 
          ? Math.round((completedEnrollments / totalEnrollments) * 100) 
          : 0,
      },
      recentEnrollments: enrollments,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Create course (admin)
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

    // If course is published, send notification to instructor
    if (req.body.status === 'published' && course.status !== 'published') {
      await createNotification(
        course.instructor,
        'course_published',
        '📢 Course Published',
        `Your course "${course.title}" has been published and is now live!`,
        { courseTitle: course.title },
        `/course/${course._id}`,
        '📢'
      );
    }

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

    // Delete all modules, lessons, enrollments
    const modules = await Module.find({ courseId: course._id });
    for (const module of modules) {
      await Lesson.deleteMany({ moduleId: module._id });
      await module.deleteOne();
    }
    await Enrollment.deleteMany({ course: course._id });
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

// Get course analytics
router.get("/courses/:id/analytics", isAdmin, hasPermission("viewAnalytics"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Get enrollment over time
    const enrollmentOverTime = await Enrollment.aggregate([
      { $match: { course: course._id } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Get lesson completion rates
    const moduleCompletion = await Module.find({ courseId: course._id });
    const completionStats = [];
    for (const module of moduleCompletion) {
      const enrollments = await Enrollment.find({ 
        course: course._id,
        'moduleProgress.moduleId': module._id
      });
      const completed = enrollments.filter(e => 
        e.moduleProgress.some(mp => 
          mp.moduleId.toString() === module._id.toString() && mp.completed
        )
      );
      completionStats.push({
        moduleTitle: module.title,
        totalEnrollments: enrollments.length,
        completed: completed.length,
        completionRate: enrollments.length > 0 
          ? Math.round((completed.length / enrollments.length) * 100) 
          : 0,
      });
    }

    res.json({
      success: true,
      enrollmentOverTime,
      moduleCompletion: completionStats,
    });
  } catch (error) {
    console.error("Course analytics error:", error);
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
    const { page = 1, limit = 10, status = "", search = "" } = req.query;
    const query = {};

    if (status) {
      query.paymentStatus = status;
    }

    let enrollments = await Enrollment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("user", "name email profilePicture")
      .populate("course", "title thumbnail price instructor")
      .populate({
        path: "course",
        populate: {
          path: "instructor",
          select: "name email",
        },
      });

    // Apply search filter if provided
    if (search) {
      enrollments = enrollments.filter(e => 
        e.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        e.course?.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Enrollment.countDocuments(query);

    // Calculate stats
    const totalRevenue = await Enrollment.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalFree = await Enrollment.countDocuments({ paymentStatus: "free" });
    const totalPaid = await Enrollment.countDocuments({ paymentStatus: "completed" });
    const totalPending = await Enrollment.countDocuments({ paymentStatus: "pending" });

    res.json({
      success: true,
      enrollments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      stats: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalFree,
        totalPaid,
        totalPending,
      },
    });
  } catch (error) {
    console.error("Get enrollments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get single enrollment
router.get("/enrollments/:id", isAdmin, hasPermission("viewAnalytics"), async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("user", "name email profilePicture")
      .populate({
        path: "course",
        populate: {
          path: "instructor",
          select: "name email",
        },
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    res.json({
      success: true,
      enrollment,
    });
  } catch (error) {
    console.error("Get enrollment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Update enrollment status
router.put("/enrollments/:id", isAdmin, hasPermission("manageUsers"), async (req, res) => {
  try {
    const { paymentStatus, progress, completed } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    if (paymentStatus) enrollment.paymentStatus = paymentStatus;
    if (progress !== undefined) enrollment.progress = progress;
    if (completed !== undefined) {
      enrollment.completed = completed;
      if (completed) enrollment.completedAt = new Date();
    }

    await enrollment.save();

    res.json({
      success: true,
      message: "Enrollment updated successfully",
      enrollment,
    });
  } catch (error) {
    console.error("Update enrollment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});



// Delete enrollment
router.delete("/enrollments/:id", isAdmin, hasPermission("manageUsers"), async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Remove student from course
    const course = await Course.findById(enrollment.course);
    if (course) {
      course.students = course.students.filter(s => 
        s.userId.toString() !== enrollment.user.toString()
      );
      course.enrollments = Math.max(0, course.enrollments - 1);
      await course.save();
    }

    await enrollment.deleteOne();
    res.json({
      success: true,
      message: "Enrollment deleted successfully",
    });
  } catch (error) {
    console.error("Delete enrollment error:", error);
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




// Approve creator request
router.put("/admin/approve-creator/:userId", isAdmin, hasPermission("manageUsers"), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isCreator) {
      return res.status(400).json({
        success: false,
        message: "User is already a creator",
      });
    }

    user.isCreator = true;
    user.role = 'creator';
    user.creatorRequest.status = 'approved';
    user.creatorRequest.reviewedAt = new Date();
    await user.save();

    // Send approval notification
    await NotificationHelpers.creatorRequestApproved(user._id, user.name);

    res.status(200).json({
      success: true,
      message: "Creator request approved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isCreator: user.isCreator,
      },
    });
  } catch (error) {
    console.error("Approve creator error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Reject creator request
router.put("/admin/reject-creator/:userId", isAdmin, hasPermission("manageUsers"), async (req, res) => {
  try {
    const { notes } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.creatorRequest.status = 'rejected';
    user.creatorRequest.reviewedAt = new Date();
    user.creatorRequest.notes = notes || '';
    await user.save();

    // Send rejection notification
    await NotificationHelpers.creatorRequestRejected(user._id, user.name, notes);

    res.status(200).json({
      success: true,
      message: "Creator request rejected",
    });
  } catch (error) {
    console.error("Reject creator error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});



// Update admin permissions (super admin only)
router.put("/admins/:adminId/permissions", isAdmin, hasPermission("manageAdmins"), async (req, res) => {
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
});

// Update admin status (activate/deactivate)
router.put("/admins/:adminId/status", isAdmin, hasPermission("manageAdmins"), async (req, res) => {
  try {
    const { isActive } = req.body;
    const admin = await Admin.findById(req.params.adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Prevent deactivating self
    if (admin._id.toString() === req.admin._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Cannot modify your own status",
      });
    }

    // Prevent deactivating super admin
    if (admin.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot deactivate super admin",
      });
    }

    admin.isActive = isActive;
    await admin.save();

    res.json({
      success: true,
      message: `Admin ${isActive ? 'activated' : 'deactivated'} successfully`,
      admin: {
        id: admin._id,
        name: admin.name,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    console.error("Update admin status error:", error);
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

    // Prevent deleting self
    if (admin._id.toString() === req.admin._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete your own account",
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

// =============== SYSTEM STATS ===============

// Get system stats (super admin only)
router.get("/system/stats", isAdmin, hasPermission("manageAdmins"), async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      totalAdmins,
      totalLessons,
      totalModules,
      totalCompleted,
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Enrollment.aggregate([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Admin.countDocuments(),
      Lesson.countDocuments(),
      Module.countDocuments(),
      Enrollment.countDocuments({ completed: true }),
    ]);

    // Get storage usage (approximate)
    const coursesWithThumbnails = await Course.find({ thumbnail: { $exists: true } });
    const storageUsage = {
      thumbnails: coursesWithThumbnails.length * 0.5, // Approximate MB
      videos: 0, // Would need to calculate from actual video storage
    };

    res.json({
      success: true,
      stats: {
        users: totalUsers,
        courses: totalCourses,
        enrollments: totalEnrollments,
        revenue: totalRevenue[0]?.total || 0,
        admins: totalAdmins,
        lessons: totalLessons,
        modules: totalModules,
        completedCourses: totalCompleted,
        storageUsage,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
    });
  } catch (error) {
    console.error("System stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// =============== EXPORT ===============
module.exports = router;