// routes/CourseRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const Quiz = require("../models/Quiz");
const Assignment = require("../models/Assignment");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const { authenticate, optionalAuth } = require("../middleware/auth");
const cloudinary = require("../config/cloudinary");
const NotificationHelpers = require("../utils/notificationHelpers");

// ==================== GET ALL PUBLISHED COURSES ====================
router.get("/published", optionalAuth, async (req, res) => {
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

// ==================== CHECK COURSE AVAILABILITY ====================
router.get("/course-availability/:courseId", optionalAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
        available: false
      });
    }

    const course = await Course.findById(courseId).select('title status isPublished price isPaid');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
        available: false
      });
    }

    const isAvailable = course.status === 'published' && course.isPublished === true;
    
    let isEnrolled = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({
        user: req.user._id,
        course: courseId,
      });
      isEnrolled = !!enrollment;
    }

    res.status(200).json({
      success: true,
      available: isAvailable,
      isEnrolled,
      course: {
        _id: course._id,
        title: course.title,
        isPaid: course.isPaid,
        price: course.price,
        status: course.status,
        isPublished: course.isPublished,
      }
    });
  } catch (error) {
    console.error("Course availability check error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      available: false
    });
  }
});

// ==================== GET COURSE BY ID ====================
router.get("/courses/:courseId", optionalAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId)
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

    let isEnrolled = false;
    let enrollment = null;
    
    if (req.user) {
      enrollment = await Enrollment.findOne({
        user: req.user._id,
        course: course._id,
      });
      isEnrolled = !!enrollment;
    }

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

// ==================== GET COURSE CONTENT (FOR ENROLLED USERS) ====================
router.get("/course-content/:courseId", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId)
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
      })
      .populate('instructor', 'name email profilePicture');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

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

// ==================== ENROLL IN COURSE ====================
router.post("/enroll/:courseId", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    console.log(`📚 Enrollment request for course: ${courseId} by user: ${req.user._id}`);

    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID. Please provide a valid course identifier.",
        code: "INVALID_COURSE_ID"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format.",
        code: "INVALID_OBJECT_ID"
      });
    }

    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
        code: "COURSE_NOT_FOUND"
      });
    }

    console.log(`✅ Course found: ${course.title}`);

    if (course.status !== 'published' || !course.isPublished) {
      return res.status(400).json({
        success: false,
        message: "This course is not available for enrollment yet.",
        code: "COURSE_NOT_PUBLISHED"
      });
    }

    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });

    if (existingEnrollment) {
      return res.status(200).json({
        success: true,
        alreadyEnrolled: true,
        message: "You are already enrolled in this course",
        enrollment: existingEnrollment,
        course: {
          _id: course._id,
          title: course.title,
        }
      });
    }

    const user = await User.findById(req.user._id);
    if (!user || user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is not active. Please contact support.",
        code: "ACCOUNT_INACTIVE"
      });
    }

    if (course.isPaid && course.price > 0) {
      return res.status(200).json({
        success: true,
        requiresPayment: true,
        courseId: course._id,
        amount: course.discountPrice || course.price,
        message: "This course requires payment. Please proceed to payment.",
        course: {
          _id: course._id,
          title: course.title,
          price: course.price,
          discountPrice: course.discountPrice,
        }
      });
    }

    const modules = await Module.find({ courseId: course._id });

    const enrollment = new Enrollment({
      user: req.user._id,
      course: course._id,
      paymentStatus: 'free',
      amount: 0,
      progress: 0,
      moduleProgress: modules.map(module => ({
        moduleId: module._id,
        completed: false,
        lessonProgress: [],
        quizAttempts: [],
      })),
    });

    await enrollment.save();
    console.log(`✅ Enrollment created for user: ${req.user.email}, course: ${course.title}`);

    course.students = course.students || [];
    const alreadyInCourse = course.students.some(s => s.userId.toString() === req.user._id.toString());
    if (!alreadyInCourse) {
      course.students.push({
        userId: req.user._id,
        enrolledAt: new Date(),
      });
    }
    course.enrollments = (course.enrollments || 0) + 1;
    await course.save();

    try {
      await NotificationHelpers.courseEnrollment(req.user._id, course.title, course._id);
    } catch (notificationError) {
      console.error('⚠️ Notification error (non-critical):', notificationError.message);
    }

    res.status(201).json({
      success: true,
      message: "Successfully enrolled in the course",
      enrollment,
      course: {
        _id: course._id,
        title: course.title,
      }
    });

  } catch (error) {
    console.error("❌ Enroll error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
        code: "CAST_ERROR"
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error: " + error.message,
        code: "VALIDATION_ERROR"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to enroll in course. Please try again.",
      code: "ENROLLMENT_FAILED",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== UPDATE LESSON PROGRESS ====================
router.put("/lesson-progress/:courseId/:moduleId/:lessonId", authenticate, async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const { completed } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId) || 
        !mongoose.Types.ObjectId.isValid(moduleId) || 
        !mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    let moduleProgress = enrollment.moduleProgress.find(
      mp => mp.moduleId.toString() === moduleId
    );

    if (!moduleProgress) {
      moduleProgress = {
        moduleId: moduleId,
        completed: false,
        lessonProgress: [],
        quizAttempts: [],
      };
      enrollment.moduleProgress.push(moduleProgress);
      moduleProgress = enrollment.moduleProgress.find(
        mp => mp.moduleId.toString() === moduleId
      );
    }

    let lessonProgress = moduleProgress.lessonProgress.find(
      lp => lp.lessonId.toString() === lessonId
    );

    if (!lessonProgress) {
      lessonProgress = {
        lessonId: lessonId,
        completed: false,
      };
      moduleProgress.lessonProgress.push(lessonProgress);
      lessonProgress = moduleProgress.lessonProgress.find(
        lp => lp.lessonId.toString() === lessonId
      );
    }

    lessonProgress.completed = completed;
    if (completed) {
      lessonProgress.completedAt = new Date();
    }

    const module = await Module.findById(moduleId);
    if (module) {
      const allLessonsCompleted = module.lessons.every(lesson => {
        const lp = moduleProgress.lessonProgress.find(
          p => p.lessonId.toString() === lesson._id.toString()
        );
        return lp?.completed;
      });

      if (allLessonsCompleted && !moduleProgress.completed) {
        moduleProgress.completed = true;
        moduleProgress.completedAt = new Date();
      }
    }

    const course = await Course.findById(courseId);
    if (course && course.modules.length > 0) {
      const totalModules = course.modules.length;
      const completedModules = enrollment.moduleProgress.filter(mp => mp.completed).length;
      enrollment.progress = Math.round((completedModules / totalModules) * 100);
    }

    await enrollment.save();

    if (enrollment.progress === 100 && !enrollment.completed) {
      enrollment.completed = true;
      enrollment.completedAt = new Date();
      await enrollment.save();

      try {
        await NotificationHelpers.courseCompletion(req.user._id, course.title, course._id);
      } catch (notificationError) {
        console.error('⚠️ Notification error (non-critical):', notificationError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Lesson progress updated",
      enrollment,
    });
  } catch (error) {
    console.error("Update lesson progress error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

// ==================== QUIZ ATTEMPT ====================
router.post("/quiz-attempt/:quizId", authenticate, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

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
        isCorrect = JSON.stringify(userAnswer?.sort()) === JSON.stringify(correctOptions.sort());
      } else if (question.type === 'truefalse') {
        isCorrect = userAnswer === question.options.find(opt => opt.isCorrect)?.text;
      }

      if (isCorrect) correctAnswers++;
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    const module = await Module.findById(quiz.moduleId);
    const course = await Course.findById(module.courseId);
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });

    if (enrollment) {
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

        try {
          await NotificationHelpers.quizResult(
            req.user._id,
            quiz.title,
            score,
            passed,
            module._id
          );
        } catch (notificationError) {
          console.error('⚠️ Notification error (non-critical):', notificationError.message);
        }

        if (passed) {
          const allModules = await Module.find({ courseId: course._id });
          const allCompleted = allModules.every(m => {
            const mp = enrollment.moduleProgress.find(
              p => p.moduleId.toString() === m._id.toString()
            );
            return mp?.completed;
          });

          if (allCompleted) {
            try {
              await NotificationHelpers.courseCompletion(
                req.user._id,
                course.title,
                course._id
              );
            } catch (notificationError) {
              console.error('⚠️ Notification error (non-critical):', notificationError.message);
            }
          }
        }
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

// ==================== GET CREATOR COURSES ====================
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

// ==================== CREATE COURSE ====================
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

    user.totalCourses = (user.totalCourses || 0) + 1;
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

// ==================== UPDATE COURSE ====================
router.put("/courses/:courseId", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

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
        message: "You don't have permission to update this course",
      });
    }

    const updates = req.body;
    
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

// ==================== PUBLISH COURSE ====================
router.put("/courses/:courseId/publish", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

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
        message: "You don't have permission to publish this course",
      });
    }

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

    try {
      await NotificationHelpers.coursePublished(req.user._id, course.title, course._id);
    } catch (notificationError) {
      console.error('⚠️ Notification error (non-critical):', notificationError.message);
    }

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

// ==================== DELETE COURSE ====================
router.delete("/courses/:courseId", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

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
        message: "You don't have permission to delete this course",
      });
    }

    const modules = await Module.find({ courseId: course._id });
    for (const module of modules) {
      await Lesson.deleteMany({ moduleId: module._id });
      await Quiz.deleteMany({ moduleId: module._id });
      await Assignment.deleteMany({ moduleId: module._id });
      await module.deleteOne();
    }

    await course.deleteOne();

    const user = await User.findById(req.user._id);
    user.totalCourses = Math.max(0, (user.totalCourses || 0) - 1);
    await user.save();

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

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

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
    const { moduleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

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
    const { moduleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

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
        message: "You don't have permission to delete this module",
      });
    }

    await Lesson.deleteMany({ moduleId: module._id });
    await Quiz.deleteMany({ moduleId: module._id });
    await Assignment.deleteMany({ moduleId: module._id });

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

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

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

    module.lessons.push(lesson._id);
    await module.save();

    course.totalLessons = (course.totalLessons || 0) + 1;
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
    const { lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID",
      });
    }

    const lesson = await Lesson.findById(lessonId);
    
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
    const { lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID",
      });
    }

    const lesson = await Lesson.findById(lessonId);
    
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

    module.lessons = module.lessons.filter(l => l.toString() !== lesson._id.toString());
    await module.save();

    course.totalLessons = Math.max(0, (course.totalLessons || 0) - 1);
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

// Create quiz
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

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

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
    const { quizId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const quiz = await Quiz.findById(quizId);
    
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
    const { quizId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const quiz = await Quiz.findById(quizId);
    
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

// ==================== GET ENROLLED COURSES ====================
router.get("/my-courses", authenticate, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ 
      user: req.user._id,
      paymentStatus: { $in: ['free', 'completed'] }
    })
    .populate({
      path: 'course',
      populate: {
        path: 'instructor',
        select: 'name profilePicture'
      }
    })
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      enrollments,
    });
  } catch (error) {
    console.error("Get my courses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==================== GET COURSE STATISTICS (FOR CREATOR) ====================
router.get("/course-stats/:courseId", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

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
        message: "You don't have permission to view this course's statistics",
      });
    }

    const totalStudents = course.students?.length || 0;
    const completedStudents = course.students?.filter(s => s.completed).length || 0;
    const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;

    const totalReviews = course.reviews?.length || 0;
    const averageRating = totalReviews > 0 
      ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    res.status(200).json({
      success: true,
      statistics: {
        totalStudents,
        completedStudents,
        completionRate,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        enrollments: course.enrollments || 0,
        views: course.views || 0,
        totalLessons: course.totalLessons || 0,
        totalModules: course.modules?.length || 0,
      }
    });
  } catch (error) {
    console.error("Get course stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==================== ADD REVIEW TO COURSE ====================// routes/CourseRoutes.js - Update the add review route

// Add review to course
router.post("/courses/:courseId/review", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to leave a review",
      });
    }

    // Check if user already reviewed
    const existingReview = course.reviews.find(
      r => r.userId.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }

    course.reviews.push({
      userId: req.user._id,
      rating: rating || 5,
      comment: comment || '',
      createdAt: new Date(),
    });

    // Update course rating
    const totalReviews = course.reviews.length;
    const avgRating = course.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    course.rating = Math.round(avgRating * 10) / 10;

    await course.save();

    // Populate the user data for the new review
    await course.populate('reviews.userId', 'name profilePicture');

    const newReview = course.reviews[course.reviews.length - 1];

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview,
      averageRating: course.rating,
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
module.exports = router;