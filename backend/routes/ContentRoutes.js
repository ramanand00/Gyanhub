// routes/ContentRoutes.js
const express = require("express");
const router = express.Router();
const Content = require("../models/Content");
const { isAdmin, hasPermission } = require("../middleware/auth");

// ==================== ADMIN ENDPOINTS ====================

// ==================== GET CONTENT STATS ====================
router.get("/content/stats", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const types = ['faq', 'documentation', 'policy', 'announcement', 'help'];
    const stats = { total: 0 };
    
    for (const type of types) {
      const count = await Content.countDocuments({ type });
      stats[type] = count;
      stats.total += count;
    }

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("❌ Get stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== GET ALL CONTENT ====================
router.get("/content", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const { type, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const content = await Content.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Content.countDocuments(query);

    res.json({
      success: true,
      content,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error("❌ Get content error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== GET CONTENT BY ID ====================
router.get("/content/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    res.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("❌ Get content by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== CREATE CONTENT ====================
router.post("/content", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const { 
      type, 
      title, 
      content, 
      category, 
      isPublished,
      // Optional fields
      faqData,
      policyData,
      docData,
      metadata 
    } = req.body;

    // Validate required fields
    if (!type || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "Type, title, and content are required",
      });
    }

    // Validate content type
    const validTypes = ['faq', 'documentation', 'policy', 'announcement', 'help'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid content type",
      });
    }

    // Auto-generate slug
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug exists
    const existing = await Content.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-6)}`;
    }

    const newContent = new Content({
      type,
      title,
      content,
      slug,
      category: category || 'General',
      isPublished: isPublished !== undefined ? isPublished : true,
      publishedAt: isPublished ? new Date() : null,
      // Optional data
      faqData: faqData || {},
      policyData: policyData || {},
      docData: docData || {},
      metadata: metadata || {},
    });

    await newContent.save();

    res.status(201).json({
      success: true,
      message: "Content created successfully",
      content: newContent,
    });
  } catch (error) {
    console.error("❌ Create content error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== UPDATE CONTENT ====================
router.put("/content/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    const { 
      title, 
      content: newContent, 
      category, 
      isPublished,
      faqData,
      policyData,
      docData,
      metadata 
    } = req.body;

    // Update fields
    if (title) {
      content.title = title;
      // Update slug if title changes
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Check if new slug conflicts with other documents
      if (newSlug !== content.slug) {
        const existing = await Content.findOne({ 
          slug: newSlug, 
          _id: { $ne: content._id } 
        });
        if (!existing) {
          content.slug = newSlug;
        } else {
          content.slug = `${newSlug}-${Date.now().toString().slice(-6)}`;
        }
      }
    }

    if (newContent) content.content = newContent;
    if (category) content.category = category;
    if (isPublished !== undefined) {
      content.isPublished = isPublished;
      if (isPublished && !content.publishedAt) {
        content.publishedAt = new Date();
      }
    }
    if (faqData) content.faqData = faqData;
    if (policyData) content.policyData = policyData;
    if (docData) content.docData = docData;
    if (metadata) content.metadata = metadata;

    await content.save();

    res.json({
      success: true,
      message: "Content updated successfully",
      content,
    });
  } catch (error) {
    console.error("❌ Update content error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== DELETE CONTENT ====================
router.delete("/content/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    await content.deleteOne();

    res.json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete content error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== BULK DELETE ====================
router.delete("/content/bulk/delete", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const { contentIds } = req.body;
    
    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Content IDs are required",
      });
    }

    const result = await Content.deleteMany({
      _id: { $in: contentIds }
    });

    res.json({
      success: true,
      message: `${result.deletedCount} items deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Bulk delete error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== BULK UPDATE STATUS ====================
router.put("/content/bulk/status", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const { contentIds, isPublished } = req.body;
    
    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Content IDs are required",
      });
    }

    const result = await Content.updateMany(
      { _id: { $in: contentIds } },
      { 
        isPublished: isPublished,
        publishedAt: isPublished ? new Date() : null,
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} items updated successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Bulk update status error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== PUBLIC ENDPOINTS ====================

// ==================== GET PUBLIC CONTENT BY TYPE ====================
router.get("/public/content/:type", async (req, res) => {
  try {
    const { type } = req.params;
    
    // Validate type
    const validTypes = ['faq', 'documentation', 'policy', 'announcement', 'help'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid content type",
      });
    }

    const content = await Content.find({
      type: type,
      isPublished: true,
    }).sort({ 
      'faqData.order': 1, 
      createdAt: -1 
    });

    res.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("❌ Get public content error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== GET PUBLIC CONTENT BY SLUG ====================
router.get("/public/content/:type/:slug", async (req, res) => {
  try {
    const { type, slug } = req.params;
    
    const content = await Content.findOne({
      type: type,
      slug: slug,
      isPublished: true,
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    res.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("❌ Get public content by slug error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== GET ALL PUBLIC CONTENT ====================
router.get("/public/content", async (req, res) => {
  try {
    const content = await Content.find({
      isPublished: true,
    }).sort({ type: 1, createdAt: -1 });

    // Group by type
    const grouped = {
      faq: [],
      documentation: [],
      policy: [],
      announcement: [],
      help: [],
    };

    content.forEach(item => {
      if (grouped[item.type]) {
        grouped[item.type].push(item);
      }
    });

    res.json({
      success: true,
      content: grouped,
    });
  } catch (error) {
    console.error("❌ Get all public content error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== GET PUBLIC POLICY BY NAME ====================
router.get("/public/policy/:name", async (req, res) => {
  try {
    const { name } = req.params;
    
    const validPolicies = ['privacy', 'terms', 'cookies'];
    if (!validPolicies.includes(name)) {
      return res.status(400).json({
        success: false,
        message: "Invalid policy name",
      });
    }

    // Map policy names to slugs
    const slugMap = {
      'privacy': 'privacy-policy',
      'terms': 'terms-of-service',
      'cookies': 'cookies-policy',
    };

    const content = await Content.findOne({
      type: 'policy',
      slug: slugMap[name],
      isPublished: true,
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    res.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("❌ Get public policy error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== SEARCH PUBLIC CONTENT ====================
router.get("/public/search", async (req, res) => {
  try {
    const { q, type } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const query = {
      isPublished: true,
      $text: { $search: q },
    };

    if (type) {
      query.type = type;
    }

    const content = await Content.find(query)
      .sort({ score: { $meta: "textScore" } })
      .limit(20);

    res.json({
      success: true,
      content,
      query: q,
    });
  } catch (error) {
    console.error("❌ Search public content error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// routes/ContentRoutes.js - Add this endpoint

// ==================== CREATE DEFAULT CONTENT ====================
router.post("/content/create-default", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const defaultContent = {
      faqs: [
        {
          title: 'What is GyanPark?',
          category: 'Getting Started',
          content: `<h3>What is GyanPark?</h3>\n<p>GyanPark is a comprehensive learning management platform that provides access to educational programs, courses, and study materials. It connects learners with creators and offers a structured learning experience.</p>`,
        },
        {
          title: 'How do I create an account?',
          category: 'Getting Started',
          content: `<h3>How do I create an account?</h3>\n<p>You can create an account by clicking on the "Register" button on the login page. Fill in your details, verify your email with OTP, and you're ready to start learning!</p>`,
        },
        {
          title: 'Is GyanPark free to use?',
          category: 'Pricing',
          content: `<h3>Is GyanPark free to use?</h3>\n<p>GyanPark offers both free and paid content. Many programs and courses are free, while some premium courses require payment. You can browse and access free content without any cost.</p>`,
        },
        {
          title: 'How do I access my enrolled courses?',
          category: 'Learning',
          content: `<h3>How do I access my enrolled courses?</h3>\n<p>You can access your enrolled courses by clicking on "My Learning" in the navigation menu. This will show you all your enrolled courses with their progress.</p>`,
        },
        {
          title: 'Can I download course materials?',
          category: 'Learning',
          content: `<h3>Can I download course materials?</h3>\n<p>Yes, you can download PDFs, notes, and other materials from your courses. Look for the download button or PDF link within the lesson content.</p>`,
        },
        {
          title: 'How is my progress tracked?',
          category: 'Learning',
          content: `<h3>How is my progress tracked?</h3>\n<p>Your progress is automatically tracked as you complete lessons and quizzes. You can see your progress percentage on the course page and in "My Learning" section.</p>`,
        },
        {
          title: 'How do I become a creator?',
          category: 'Creator Program',
          content: `<h3>How do I become a creator?</h3>\n<p>You can apply to become a creator by going to Settings → Creator Status and filling out the application form. Our team will review your application and get back to you.</p>`,
        },
        {
          title: 'What are the requirements to become a creator?',
          category: 'Creator Program',
          content: `<h3>What are the requirements to become a creator?</h3>\n<p>We look for subject matter expertise, teaching experience, and a passion for education. You should have at least 2-3 years of experience in your field and a portfolio of work.</p>`,
        },
        {
          title: 'What payment methods are accepted?',
          category: 'Payments',
          content: `<h3>What payment methods are accepted?</h3>\n<p>We accept payments through eSewa and Khalti, two of Nepal's leading digital payment platforms. Both are secure and widely used.</p>`,
        },
        {
          title: 'What is your refund policy?',
          category: 'Payments',
          content: `<h3>What is your refund policy?</h3>\n<p>We offer a 7-day money-back guarantee for all paid courses. If you're not satisfied, you can request a refund within 7 days of enrollment.</p>`,
        },
      ],
      documentation: [
        {
          title: 'Getting Started with GyanPark',
          category: 'Getting Started',
          content: `<h2>Getting Started with GyanPark 🚀</h2>\n<p>Welcome to GyanPark! This guide will help you get started with the platform.</p>\n\n<h3>What is GyanPark?</h3>\n<p>GyanPark is a learning management platform that connects students with educational content and creators.</p>\n\n<h3>Key Features</h3>\n<ul>\n<li>📚 Programs and Semesters</li>\n<li>🎓 Courses with video lessons</li>\n<li>📊 Progress tracking</li>\n<li>🏆 Certificates</li>\n</ul>`,
        },
        {
          title: 'Student Guide',
          category: 'Students',
          content: `<h2>Student Guide 📚</h2>\n<p>Everything you need to know as a student on GyanPark.</p>\n\n<h3>Finding Content</h3>\n<p>Use the search bar or browse categories to find courses.</p>\n\n<h3>Enrolling in Courses</h3>\n<p>Click on any course and click "Enroll Now".</p>\n\n<h3>Tracking Progress</h3>\n<p>View your progress in the "My Learning" section.</p>`,
        },
        {
          title: 'Creator Guide',
          category: 'Creators',
          content: `<h2>Creator Guide 🎓</h2>\n<p>Create and publish courses like a pro on GyanPark.</p>\n\n<h3>Becoming a Creator</h3>\n<p>Go to Settings → Creator Status and fill out the application.</p>\n\n<h3>Creating Courses</h3>\n<p>Use the Course Builder to create modules, lessons, and quizzes.</p>`,
        },
        {
          title: 'Admin Guide',
          category: 'Administrators',
          content: `<h2>Admin Guide ⚙️</h2>\n<p>Manage your platform effectively with these admin features.</p>\n\n<h3>Dashboard Overview</h3>\n<p>The dashboard provides an overview of platform statistics.</p>\n\n<h3>User Management</h3>\n<p>Manage users, verify accounts, and handle creator requests.</p>`,
        },
      ],
      policies: [
        {
          title: 'Privacy Policy',
          slug: 'privacy-policy',
          category: 'Legal',
          content: `<h2>Privacy Policy</h2>\n<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>\n\n<h3>1. Information We Collect</h3>\n<p>We collect information you provide directly to us.</p>\n\n<h3>2. How We Use Your Information</h3>\n<p>We use your information to provide and improve our services.</p>\n\n<h3>3. Contact Us</h3>\n<p>For privacy-related questions, contact us at privacy@gyanpark.com</p>`,
        },
        {
          title: 'Terms of Service',
          slug: 'terms-of-service',
          category: 'Legal',
          content: `<h2>Terms of Service</h2>\n<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>\n\n<h3>1. Acceptance of Terms</h3>\n<p>By using GyanPark, you agree to these Terms of Service.</p>\n\n<h3>2. User Accounts</h3>\n<p>You are responsible for maintaining the security of your account.</p>\n\n<h3>3. Contact Us</h3>\n<p>For questions, contact us at support@gyanpark.com</p>`,
        },
        {
          title: 'Cookies Policy',
          slug: 'cookies-policy',
          category: 'Legal',
          content: `<h2>Cookies Policy</h2>\n<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>\n\n<h3>1. What Are Cookies?</h3>\n<p>Cookies are small text files stored on your device.</p>\n\n<h3>2. How We Use Cookies</h3>\n<p>We use essential, performance, and functional cookies.</p>\n\n<h3>3. Contact Us</h3>\n<p>For questions, contact us at support@gyanpark.com</p>`,
        },
      ],
      announcements: [
        {
          title: 'Welcome to GyanPark! 🎉',
          category: 'Welcome',
          content: `<h2>Welcome to GyanPark! 🎉</h2>\n<p>We are excited to announce the launch of GyanPark - your new learning platform.</p>\n<p>Start exploring now and make the most of your learning experience!</p>`,
        },
      ],
      help: [
        {
          title: 'How to Reset Your Password',
          category: 'Account Help',
          content: `<h2>How to Reset Your Password 🔑</h2>\n\n<h3>Problem</h3>\n<p>You can't log in because you forgot your password.</p>\n\n<h3>Solution</h3>\n<ol>\n<li><strong>Go to Login Page:</strong> Click on "Forgot Password?"</li>\n<li><strong>Enter Email:</strong> Enter your email address</li>\n<li><strong>Check Email:</strong> You'll receive a reset link</li>\n<li><strong>Set New Password:</strong> Enter and confirm your new password</li>\n</ol>`,
        },
        {
          title: 'How to Enroll in a Course',
          category: 'Learning Help',
          content: `<h2>How to Enroll in a Course 📚</h2>\n\n<h3>Problem</h3>\n<p>You want to start learning but don't know how to enroll.</p>\n\n<h3>Solution</h3>\n<ol>\n<li><strong>Browse Courses:</strong> Go to the Courses page</li>\n<li><strong>Select Course:</strong> Click on a course</li>\n<li><strong>Enroll:</strong> Click "Enroll Now" button</li>\n<li><strong>Start Learning:</strong> Access the course content</li>\n</ol>`,
        },
      ],
    };

    let created = 0;
    let skipped = 0;

    // Create FAQs
    for (const faq of defaultContent.faqs) {
      const existing = await Content.findOne({ title: faq.title, type: 'faq' });
      if (!existing) {
        await new Content({ ...faq, type: 'faq', isPublished: true }).save();
        created++;
      } else {
        skipped++;
      }
    }

    // Create Documentation
    for (const doc of defaultContent.documentation) {
      const existing = await Content.findOne({ title: doc.title, type: 'documentation' });
      if (!existing) {
        await new Content({ ...doc, type: 'documentation', isPublished: true }).save();
        created++;
      } else {
        skipped++;
      }
    }

    // Create Policies
    for (const policy of defaultContent.policies) {
      const existing = await Content.findOne({ slug: policy.slug, type: 'policy' });
      if (!existing) {
        await new Content({ ...policy, type: 'policy', isPublished: true }).save();
        created++;
      } else {
        skipped++;
      }
    }

    // Create Announcements
    for (const announcement of defaultContent.announcements) {
      const existing = await Content.findOne({ title: announcement.title, type: 'announcement' });
      if (!existing) {
        await new Content({ ...announcement, type: 'announcement', isPublished: true }).save();
        created++;
      } else {
        skipped++;
      }
    }

    // Create Help Articles
    for (const help of defaultContent.help) {
      const existing = await Content.findOne({ title: help.title, type: 'help' });
      if (!existing) {
        await new Content({ ...help, type: 'help', isPublished: true }).save();
        created++;
      } else {
        skipped++;
      }
    }

    res.json({
      success: true,
      message: `Default content created successfully!`,
      created,
      skipped,
    });
  } catch (error) {
    console.error("❌ Create default content error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


module.exports = router;