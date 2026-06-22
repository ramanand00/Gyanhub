// routes/CourseRoutes.js
const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const Quiz = require("../models/Quiz");
const Assignment = require("../models/Assignment");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");
const cloudinary = require("../config/cloudinary");

// ==================== CREATOR ROLE MANAGEMENT ====================

// Request to become a creator
router.post("/request-creator", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
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
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: "Creator request submitted successfully. Please wait for approval.",
    });
  } catch (error) {
    console.error("Request creator error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Check creator status
router.get("/creator-status", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      success: true,
      isCreator: user.isCreator,
      creatorRequest: user.creatorRequest,
    });
  } catch (error) {
    console.error("Creator status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==================== COURSE MANAGEMENT ====================

// Create a new course
router.post("/courses", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only creators can create courses",
      });
    }

    const {
      title,
      description,
      shortDescription,
      category,
      subCategory,
      level,
      price,
      discountPrice,
      thumbnail,
      learningOutcomes,
      prerequisites,
      targetAudience,
      language,
      tags,
      whatYouWillLearn,
      requirements,
    } = req.body;

    // Handle thumbnail upload if it's base64
    let thumbnailUrl = thumbnail;
    if (thumbnail && thumbnail.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(thumbnail, {
        folder: 'course_thumbnails',
        width: 1200,
        height: 630,
        crop: 'limit',
        quality: 'auto',
      });
      thumbnailUrl = uploadResponse.secure_url;
    }

    const course = new Course({
      title,
      description,
      shortDescription,
      category,
      subCategory,
      level,
      price: price || 0,
      discountPrice: discountPrice || 0,
      thumbnail: thumbnailUrl,
      instructor: req.user._id,
      learningOutcomes: learningOutcomes || [],
      prerequisites: prerequisites || [],
      targetAudience: targetAudience || [],
      language: language || 'English',
      tags: tags || [],
      whatYouWillLearn: whatYouWillLearn || [],
      requirements: requirements || [],
      isPaid: price > 0,
      status: 'draft',
      isPublished: false,
    });

    await course.save();

    // Update user's total courses
    user.totalCourses += 1;
    await user.save();

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

// Get all courses for a creator
router.get("/creator-courses", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only creators can access this",
      });
    }

    const courses = await Course.find({ instructor: req.user._id })
      .populate('modules')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("Get creator courses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get single course with full details
router.get("/courses/:courseId", async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate({
        path: 'modules',
        populate: {
          path: 'lessons',
          populate: {
            path: 'quiz',
          },
        },
      })
      .populate('instructor', 'name email profilePicture bio');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
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
// routes/CourseRoutes.js - Add this route at the top

// Get all published courses (public)
router.get("/published", async (req, res) => {
  try {
    const { page = 1, limit = 12, category, level, search, sort } = req.query;
    
    const query = { 
      isPublished: true,
      status: 'published'
    };
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by level
    if (level && level !== 'all') {
      query.level = level;
    }
    
    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { enrollments: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }
    
    const courses = await Course.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('instructor', 'name profilePicture');
    
    const total = await Course.countDocuments(query);
    
    // Calculate average rating for each course
    const coursesWithRating = courses.map(course => {
      const courseObj = course.toObject();
      const totalReviews = course.reviews?.length || 0;
      const avgRating = totalReviews > 0 
        ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0;
      courseObj.averageRating = Math.round(avgRating * 10) / 10;
      courseObj.totalReviews = totalReviews;
      return courseObj;
    });
    
    res.status(200).json({
      success: true,
      courses: coursesWithRating,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
      filters: {
        category,
        level,
        search,
        sort,
      }
    });
  } catch (error) {
    console.error("Get published courses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get course by ID (with enrollment check)
router.get("/courses/:courseId", async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate({
        path: 'modules',
        populate: {
          path: 'lessons',
          populate: {
            path: 'quiz',
          },
        },
      })
      .populate('instructor', 'name email profilePicture bio totalCourses totalStudents creatorRating');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is enrolled (if authenticated)
    let isEnrolled = false;
    let enrollment = null;
    
    if (req.user) {
      enrollment = await Enrollment.findOne({
        user: req.user._id,
        course: course._id,
      });
      isEnrolled = !!enrollment;
    }

    // Calculate average rating
    const totalReviews = course.reviews?.length || 0;
    const averageRating = totalReviews > 0 
      ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    const courseObj = course.toObject();
    courseObj.averageRating = Math.round(averageRating * 10) / 10;
    courseObj.totalReviews = totalReviews;
    courseObj.isEnrolled = isEnrolled;
    courseObj.enrollment = enrollment;

    res.status(200).json({
      success: true,
      course: courseObj,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
// Update course
router.put("/courses/:courseId", authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this course",
      });
    }

    const updates = req.body;
    
    // Handle thumbnail update
    if (updates.thumbnail && updates.thumbnail.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(updates.thumbnail, {
        folder: 'course_thumbnails',
        width: 1200,
        height: 630,
        crop: 'limit',
        quality: 'auto',
      });
      updates.thumbnail = uploadResponse.secure_url;
    }

    Object.assign(course, updates);
    course.isPaid = course.price > 0;
    await course.save();

    res.status(200).json({
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

// Publish course
router.put("/courses/:courseId/publish", authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to publish this course",
      });
    }

    // Check if course has at least one module and lesson
    const modules = await Module.find({ courseId: course._id });
    if (modules.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Course must have at least one module to publish",
      });
    }

    let hasLessons = false;
    for (const module of modules) {
      const lessons = await Lesson.find({ moduleId: module._id });
      if (lessons.length > 0) {
        hasLessons = true;
        break;
      }
    }

    if (!hasLessons) {
      return res.status(400).json({
        success: false,
        message: "Course must have at least one lesson to publish",
      });
    }

    course.isPublished = true;
    course.status = 'published';
    course.publishedAt = new Date();
    await course.save();

    res.status(200).json({
      success: true,
      message: "Course published successfully",
      course,
    });
  } catch (error) {
    console.error("Publish course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Delete course
router.delete("/courses/:courseId", authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this course",
      });
    }

    // Delete all modules, lessons, quizzes, assignments
    const modules = await Module.find({ courseId: course._id });
    for (const module of modules) {
      await Lesson.deleteMany({ moduleId: module._id });
      await Quiz.deleteMany({ moduleId: module._id });
      await Assignment.deleteMany({ moduleId: module._id });
      await module.deleteOne();
    }

    await course.deleteOne();

    res.status(200).json({
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

// ==================== MODULE MANAGEMENT ====================

// Create module
router.post("/modules", authenticate, async (req, res) => {
  try {
    const { courseId, title, description, order } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to add modules to this course",
      });
    }

    const module = new Module({
      courseId,
      title,
      description,
      order: order || 0,
    });

    await module.save();

    // Add module to course
    course.modules.push(module._id);
    await course.save();

    res.status(201).json({
      success: true,
      message: "Module created successfully",
      module,
    });
  } catch (error) {
    console.error("Create module error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Update module
router.put("/modules/:moduleId", authenticate, async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    const course = await Course.findById(module.courseId);
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this module",
      });
    }

    Object.assign(module, req.body);
    await module.save();

    res.status(200).json({
      success: true,
      message: "Module updated successfully",
      module,
    });
  } catch (error) {
    console.error("Update module error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Delete module
router.delete("/modules/:moduleId", authenticate, async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    const course = await Course.findById(module.courseId);
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this module",
      });
    }

    // Delete all lessons, quizzes, assignments in this module
    await Lesson.deleteMany({ moduleId: module._id });
    await Quiz.deleteMany({ moduleId: module._id });
    await Assignment.deleteMany({ moduleId: module._id });

    // Remove module from course
    course.modules = course.modules.filter(m => m.toString() !== module._id.toString());
    await course.save();

    await module.deleteOne();

    res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    console.error("Delete module error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==================== LESSON MANAGEMENT ====================

// Create lesson
router.post("/lessons", authenticate, async (req, res) => {
  try {
    const {
      moduleId,
      title,
      description,
      order,
      type,
      content,
      isFree,
      resources,
    } = req.body;

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    const course = await Course.findById(module.courseId);
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to add lessons to this course",
      });
    }

    // Handle video upload if present
    let videoUrl = content?.videoUrl || '';
    if (content?.videoUrl && content.videoUrl.startsWith('data:video')) {
      const uploadResponse = await cloudinary.uploader.upload(content.videoUrl, {
        resource_type: 'video',
        folder: 'course_videos',
        quality: 'auto',
      });
      videoUrl = uploadResponse.secure_url;
    }

    const lesson = new Lesson({
      moduleId,
      title,
      description,
      order: order || 0,
      type: type || 'video',
      content: {
        videoUrl,
        notes: content?.notes || '',
        pdfUrl: content?.pdfUrl || '',
        duration: content?.duration || 0,
      },
      isFree: isFree || false,
      resources: resources || [],
    });

    await lesson.save();

    // Add lesson to module
    module.lessons.push(lesson._id);
    await module.save();

    // Update course total lessons
    course.totalLessons += 1;
    await course.save();

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    console.error("Create lesson error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Update lesson
router.put("/lessons/:lessonId", authenticate, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const module = await Module.findById(lesson.moduleId);
    const course = await Course.findById(module.courseId);
    
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this lesson",
      });
    }

    const updates = req.body;
    
    // Handle video upload if present
    if (updates.content?.videoUrl && updates.content.videoUrl.startsWith('data:video')) {
      const uploadResponse = await cloudinary.uploader.upload(updates.content.videoUrl, {
        resource_type: 'video',
        folder: 'course_videos',
        quality: 'auto',
      });
      updates.content.videoUrl = uploadResponse.secure_url;
    }

    Object.assign(lesson, updates);
    await lesson.save();

    res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      lesson,
    });
  } catch (error) {
    console.error("Update lesson error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Delete lesson
router.delete("/lessons/:lessonId", authenticate, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const module = await Module.findById(lesson.moduleId);
    const course = await Course.findById(module.courseId);
    
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this lesson",
      });
    }

    // Remove lesson from module
    module.lessons = module.lessons.filter(l => l.toString() !== lesson._id.toString());
    await module.save();

    // Update course total lessons
    course.totalLessons -= 1;
    await course.save();

    await lesson.deleteOne();

    res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error("Delete lesson error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==================== QUIZ MANAGEMENT ====================

// Create quiz for a module
router.post("/quizzes", authenticate, async (req, res) => {
  try {
    const {
      moduleId,
      title,
      description,
      questions,
      passingScore,
      timeLimit,
      maxAttempts,
    } = req.body;

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    const course = await Course.findById(module.courseId);
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to add quizzes to this course",
      });
    }

    const quiz = new Quiz({
      moduleId,
      title,
      description,
      questions: questions || [],
      passingScore: passingScore || 70,
      timeLimit: timeLimit || 0,
      maxAttempts: maxAttempts || 3,
    });

    await quiz.save();

    // Link quiz to module
    module.quiz = quiz._id;
    await module.save();

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Update quiz
router.put("/quizzes/:quizId", authenticate, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const module = await Module.findById(quiz.moduleId);
    const course = await Course.findById(module.courseId);
    
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this quiz",
      });
    }

    Object.assign(quiz, req.body);
    await quiz.save();

    res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (error) {
    console.error("Update quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Delete quiz
router.delete("/quizzes/:quizId", authenticate, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const module = await Module.findById(quiz.moduleId);
    const course = await Course.findById(module.courseId);
    
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this quiz",
      });
    }

    // Remove quiz from module
    module.quiz = undefined;
    await module.save();

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==================== ENROLLMENT & PAYMENT ====================

// Enroll in a course (free)
router.post("/enroll/:courseId", authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    // For paid courses, redirect to payment
    if (course.isPaid && course.price > 0) {
      return res.status(200).json({
        success: true,
        requiresPayment: true,
        courseId: course._id,
        amount: course.price,
        message: "This course requires payment. Please proceed to payment.",
      });
    }

    // For free courses, enroll directly
    const enrollment = new Enrollment({
      user: req.user._id,
      course: course._id,
      paymentStatus: 'free',
      amount: 0,
      progress: 0,
    });

    await enrollment.save();

    // Add student to course
    course.students.push({
      userId: req.user._id,
      enrolledAt: new Date(),
    });
    course.enrollments += 1;
    await course.save();

    res.status(201).json({
      success: true,
      message: "Successfully enrolled in the course",
      enrollment,
    });
  } catch (error) {
    console.error("Enroll error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get course content for enrolled user
router.get("/course-content/:courseId", authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate({
        path: 'modules',
        populate: [
          {
            path: 'lessons',
            populate: {
              path: 'quiz',
            },
          },
          {
            path: 'quiz',
          },
        ],
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You need to enroll in this course to access the content",
      });
    }

    res.status(200).json({
      success: true,
      course,
      enrollment,
    });
  } catch (error) {
    console.error("Get course content error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Submit quiz attempt
router.post("/quiz-attempt/:quizId", authenticate, async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      let isCorrect = false;

      if (question.type === 'single') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = userAnswer === correctOption?.text;
      } else if (question.type === 'multiple') {
        const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.text);
        isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(correctOptions.sort());
      } else if (question.type === 'truefalse') {
        isCorrect = userAnswer === question.options.find(opt => opt.isCorrect)?.text;
      }

      if (isCorrect) correctAnswers++;
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    // Find enrollment and update progress
    const module = await Module.findById(quiz.moduleId);
    const course = await Course.findById(module.courseId);
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });

    if (enrollment) {
      // Update module progress
      const moduleProgress = enrollment.moduleProgress.find(
        mp => mp.moduleId.toString() === module._id.toString()
      );

      if (moduleProgress) {
        moduleProgress.quizAttempts.push({
          attempt: moduleProgress.quizAttempts.length + 1,
          score,
          passed,
          attemptedAt: new Date(),
          answers: quiz.questions.map((q, index) => ({
            questionId: q._id,
            answer: answers[index],
          })),
        });

        if (passed) {
          moduleProgress.completed = true;
          moduleProgress.completedAt = new Date();
        }

        await enrollment.save();
      }
    }

    res.status(200).json({
      success: true,
      score,
      passed,
      totalQuestions,
      correctAnswers,
      message: passed ? "Congratulations! You passed the quiz." : "You didn't pass. Please try again.",
    });
  } catch (error) {
    console.error("Quiz attempt error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;