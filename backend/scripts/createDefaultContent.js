// scripts/createDefaultContent.js
require("dotenv").config();
const mongoose = require("mongoose");
const Content = require("../models/Content");

const defaultContent = {
  // ==================== FAQS ====================
  faqs: [
    {
      title: 'What is GyanPark?',
      category: 'Getting Started',
      content: `<h3>What is GyanPark?</h3>
<p>GyanPark is a comprehensive learning management platform that provides access to educational programs, courses, and study materials. It connects learners with creators and offers a structured learning experience.</p>`,
    },
    {
      title: 'How do I create an account?',
      category: 'Getting Started',
      content: `<h3>How do I create an account?</h3>
<p>You can create an account by clicking on the "Register" button on the login page. Fill in your details, verify your email with OTP, and you're ready to start learning!</p>`,
    },
    {
      title: 'Is GyanPark free to use?',
      category: 'Pricing',
      content: `<h3>Is GyanPark free to use?</h3>
<p>GyanPark offers both free and paid content. Many programs and courses are free, while some premium courses require payment. You can browse and access free content without any cost.</p>`,
    },
    {
      title: 'How do I access my enrolled courses?',
      category: 'Learning',
      content: `<h3>How do I access my enrolled courses?</h3>
<p>You can access your enrolled courses by clicking on "My Learning" in the navigation menu. This will show you all your enrolled courses with their progress.</p>`,
    },
    {
      title: 'Can I download course materials?',
      category: 'Learning',
      content: `<h3>Can I download course materials?</h3>
<p>Yes, you can download PDFs, notes, and other materials from your courses. Look for the download button or PDF link within the lesson content.</p>`,
    },
    {
      title: 'How is my progress tracked?',
      category: 'Learning',
      content: `<h3>How is my progress tracked?</h3>
<p>Your progress is automatically tracked as you complete lessons and quizzes. You can see your progress percentage on the course page and in "My Learning" section.</p>`,
    },
    {
      title: 'How do I become a creator?',
      category: 'Creator Program',
      content: `<h3>How do I become a creator?</h3>
<p>You can apply to become a creator by going to Settings → Creator Status and filling out the application form. Our team will review your application and get back to you.</p>`,
    },
    {
      title: 'What are the requirements to become a creator?',
      category: 'Creator Program',
      content: `<h3>What are the requirements to become a creator?</h3>
<p>We look for subject matter expertise, teaching experience, and a passion for education. You should have at least 2-3 years of experience in your field and a portfolio of work.</p>`,
    },
    {
      title: 'What payment methods are accepted?',
      category: 'Payments',
      content: `<h3>What payment methods are accepted?</h3>
<p>We accept payments through eSewa and Khalti, two of Nepal's leading digital payment platforms. Both are secure and widely used.</p>`,
    },
    {
      title: 'What is your refund policy?',
      category: 'Payments',
      content: `<h3>What is your refund policy?</h3>
<p>We offer a 7-day money-back guarantee for all paid courses. If you're not satisfied, you can request a refund within 7 days of enrollment.</p>`,
    },
  ],

  // ==================== DOCUMENTATION ====================
  documentation: [
    {
      title: 'Getting Started with GyanPark',
      category: 'Getting Started',
      content: `<h2>Getting Started with GyanPark 🚀</h2>
<p>Welcome to GyanPark! This guide will help you get started with the platform.</p>

<h3>What is GyanPark?</h3>
<p>GyanPark is a learning management platform that connects students with educational content and creators. It offers programs, courses, and study materials.</p>

<h3>Key Features</h3>
<ul>
<li>📚 Programs and Semesters - Structured learning paths</li>
<li>🎓 Courses with video lessons and quizzes</li>
<li>📊 Progress tracking</li>
<li>🏆 Certificates upon completion</li>
<li>👥 Community features</li>
</ul>

<h3>Getting Started Steps</h3>
<ol>
<li><strong>Create Account:</strong> Sign up with your email or Google</li>
<li><strong>Browse Content:</strong> Explore programs and courses</li>
<li><strong>Enroll:</strong> Start learning your chosen courses</li>
<li><strong>Learn:</strong> Complete lessons and quizzes</li>
<li><strong>Earn:</strong> Get certificates and showcase your achievements</li>
</ol>`,
    },
    {
      title: 'Student Guide',
      category: 'Students',
      content: `<h2>Student Guide 📚</h2>
<p>Everything you need to know as a student on GyanPark.</p>

<h3>Finding Content</h3>
<p>Use the search bar or browse categories to find courses that interest you. You can filter by category, level, and popularity.</p>

<h3>Enrolling in Courses</h3>
<p>Click on any course to view details and click "Enroll Now". Some courses are free, others may require payment through eSewa or Khalti.</p>

<h3>Tracking Progress</h3>
<p>Your progress is tracked automatically. View it in the "My Learning" section. Complete lessons and quizzes to advance.</p>

<h3>Getting Certificates</h3>
<p>Complete all course requirements to earn a certificate. Download and share your certificates on LinkedIn or other platforms.</p>`,
    },
    {
      title: 'Creator Guide',
      category: 'Creators',
      content: `<h2>Creator Guide 🎓</h2>
<p>Create and publish courses like a pro on GyanPark.</p>

<h3>Becoming a Creator</h3>
<p>Go to Settings → Creator Status and fill out the application. Our team will review your expertise and experience.</p>

<h3>Creating Courses</h3>
<p>Use the Course Builder to create modules, lessons, and quizzes. Add video content, notes, and assignments.</p>

<h3>Publishing Content</h3>
<p>Once your course is ready, publish it to make it available to students. You can update courses after publishing.</p>

<h3>Monetizing Courses</h3>
<p>Set prices for your courses and earn revenue from enrollments. Track your earnings and student engagement.</p>`,
    },
    {
      title: 'Admin Guide',
      category: 'Administrators',
      content: `<h2>Admin Guide ⚙️</h2>
<p>Manage your platform effectively with these admin features.</p>

<h3>Dashboard Overview</h3>
<p>The dashboard provides an overview of platform statistics and activities. Monitor user growth, course enrollments, and revenue.</p>

<h3>User Management</h3>
<p>Manage users, verify accounts, and handle creator requests. View user profiles and activity.</p>

<h3>Content Management</h3>
<p>Review and manage programs, courses, and other content. Ensure quality and relevance of all materials.</p>

<h3>Analytics</h3>
<p>Track platform growth, revenue, and user engagement. Make data-driven decisions to improve the platform.</p>`,
    },
  ],

  // ==================== POLICIES ====================
  policies: [
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      category: 'Legal',
      content: `<h2>Privacy Policy</h2>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

<h3>1. Information We Collect</h3>
<p>We collect information you provide directly to us, such as your name, email address, and mobile number when you create an account. We also collect usage data automatically when you interact with our platform.</p>

<h3>2. How We Use Your Information</h3>
<p>We use your information to provide and improve our services, process payments, communicate with you, and comply with legal obligations.</p>

<h3>3. Data Security</h3>
<p>We implement industry-standard security measures to protect your personal information from unauthorized access.</p>

<h3>4. Your Rights</h3>
<p>You have the right to access, correct, or delete your personal data at any time. You can also opt-out of marketing communications.</p>

<h3>5. Contact Us</h3>
<p>For privacy-related questions, contact us at <a href="mailto:privacy@gyanpark.com">privacy@gyanpark.com</a></p>`,
    },
    {
      title: 'Terms of Service',
      slug: 'terms-of-service',
      category: 'Legal',
      content: `<h2>Terms of Service</h2>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

<h3>1. Acceptance of Terms</h3>
<p>By using GyanPark, you agree to these Terms of Service. If you do not agree, please do not use our platform.</p>

<h3>2. User Accounts</h3>
<p>You are responsible for maintaining the security of your account and for all activities that occur under your account.</p>

<h3>3. Content Ownership</h3>
<p>Creators retain ownership of their content. By publishing on GyanPark, you grant us a license to host and distribute your content.</p>

<h3>4. User Conduct</h3>
<p>Users must respect others, not post illegal or harmful content, and not attempt to disrupt the platform.</p>

<h3>5. Payments and Refunds</h3>
<p>We offer a 7-day money-back guarantee for all paid courses. Contact support for refund requests.</p>

<h3>6. Contact Us</h3>
<p>For questions about these terms, contact us at <a href="mailto:support@gyanpark.com">support@gyanpark.com</a></p>`,
    },
    {
      title: 'Cookies Policy',
      slug: 'cookies-policy',
      category: 'Legal',
      content: `<h2>Cookies Policy</h2>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

<h3>1. What Are Cookies?</h3>
<p>Cookies are small text files stored on your device when you visit a website. They help us provide a better experience by remembering your preferences.</p>

<h3>2. How We Use Cookies</h3>
<p><strong>Essential Cookies:</strong> Necessary for the platform to function properly.</p>
<p><strong>Performance Cookies:</strong> Help us understand how users interact with our platform.</p>
<p><strong>Functional Cookies:</strong> Remember your preferences and settings.</p>

<h3>3. Your Cookie Choices</h3>
<p>You can manage cookie preferences in your browser settings. Blocking essential cookies may affect your experience.</p>

<h3>4. Third-Party Cookies</h3>
<p>We use Google Analytics for analytics and payment processors for secure transactions.</p>

<h3>5. Contact Us</h3>
<p>For questions about our cookie usage, contact us at <a href="mailto:support@gyanpark.com">support@gyanpark.com</a></p>`,
    },
  ],

  // ==================== ANNOUNCEMENTS ====================
  announcements: [
    {
      title: 'Welcome to GyanPark! 🎉',
      category: 'Welcome',
      content: `<h2>Welcome to GyanPark! 🎉</h2>
<p>We are excited to announce the launch of GyanPark - your new learning platform. Explore our programs, courses, and study materials to start your learning journey today.</p>
<p>Here's what you can do on GyanPark:</p>
<ul>
<li>📚 Browse programs and semesters</li>
<li>🎓 Enroll in courses</li>
<li>📊 Track your learning progress</li>
<li>🏆 Earn certificates</li>
<li>👥 Connect with instructors and learners</li>
</ul>
<p>Start exploring now and make the most of your learning experience!</p>`,
    },
  ],

  // ==================== HELP ARTICLES ====================
  helpArticles: [
    {
      title: 'How to Reset Your Password',
      category: 'Account Help',
      content: `<h2>How to Reset Your Password 🔑</h2>
<p>Forgot your password? Follow these steps to reset it.</p>

<h3>Problem</h3>
<p>You can't log in because you forgot your password.</p>

<h3>Solution</h3>
<p>Follow these steps to reset your password:</p>

<ol>
<li><strong>Go to Login Page:</strong> Click on "Forgot Password?" link</li>
<li><strong>Enter Email:</strong> Enter the email address associated with your account</li>
<li><strong>Check Email:</strong> You'll receive a password reset link in your email</li>
<li><strong>Click Link:</strong> Click the link to go to the reset page</li>
<li><strong>Set New Password:</strong> Enter and confirm your new password</li>
<li><strong>Login:</strong> Use your new password to login</li>
</ol>

<p>If you don't receive the email, check your spam folder or contact support.</p>`,
    },
    {
      title: 'How to Enroll in a Course',
      category: 'Learning Help',
      content: `<h2>How to Enroll in a Course 📚</h2>
<p>Start learning by enrolling in courses that interest you.</p>

<h3>Problem</h3>
<p>You want to start learning but don't know how to enroll in courses.</p>

<h3>Solution</h3>
<p>Follow these steps to enroll in a course:</p>

<ol>
<li><strong>Browse Courses:</strong> Go to the Courses page</li>
<li><strong>Select Course:</strong> Click on a course you're interested in</li>
<li><strong>View Details:</strong> Read the course description and requirements</li>
<li><strong>Enroll:</strong> Click "Enroll Now" button</li>
<li><strong>Payment:</strong> If it's a paid course, complete the payment</li>
<li><strong>Start Learning:</strong> Access the course content and start learning</li>
</ol>

<p>Free courses are available immediately after enrollment.</p>`,
    },
  ],
};

const createDefaultContent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📚 Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    // ==================== CREATE FAQS ====================
    console.log('\n📝 Creating FAQs...');
    for (const faq of defaultContent.faqs) {
      const existing = await Content.findOne({ 
        title: faq.title, 
        type: 'faq' 
      });
      if (!existing) {
        const newFaq = new Content({
          type: 'faq',
          title: faq.title,
          content: faq.content,
          category: faq.category,
          isPublished: true,
        });
        await newFaq.save();
        console.log(`  ✅ FAQ: ${faq.title}`);
        created++;
      } else {
        console.log(`  ⏭️ FAQ: ${faq.title} already exists`);
        skipped++;
      }
    }

    // ==================== CREATE DOCUMENTATION ====================
    console.log('\n📖 Creating Documentation...');
    for (const doc of defaultContent.documentation) {
      const existing = await Content.findOne({ 
        title: doc.title, 
        type: 'documentation' 
      });
      if (!existing) {
        const newDoc = new Content({
          type: 'documentation',
          title: doc.title,
          content: doc.content,
          category: doc.category,
          isPublished: true,
        });
        await newDoc.save();
        console.log(`  ✅ Documentation: ${doc.title}`);
        created++;
      } else {
        console.log(`  ⏭️ Documentation: ${doc.title} already exists`);
        skipped++;
      }
    }

    // ==================== CREATE POLICIES ====================
    console.log('\n📄 Creating Policies...');
    for (const policy of defaultContent.policies) {
      const existing = await Content.findOne({ 
        slug: policy.slug, 
        type: 'policy' 
      });
      if (!existing) {
        const newPolicy = new Content({
          type: 'policy',
          title: policy.title,
          slug: policy.slug,
          content: policy.content,
          category: policy.category,
          isPublished: true,
        });
        await newPolicy.save();
        console.log(`  ✅ Policy: ${policy.title}`);
        created++;
      } else {
        console.log(`  ⏭️ Policy: ${policy.title} already exists`);
        skipped++;
      }
    }

    // ==================== CREATE ANNOUNCEMENTS ====================
    console.log('\n📢 Creating Announcements...');
    for (const announcement of defaultContent.announcements) {
      const existing = await Content.findOne({ 
        title: announcement.title, 
        type: 'announcement' 
      });
      if (!existing) {
        const newAnnouncement = new Content({
          type: 'announcement',
          title: announcement.title,
          content: announcement.content,
          category: announcement.category,
          isPublished: true,
        });
        await newAnnouncement.save();
        console.log(`  ✅ Announcement: ${announcement.title}`);
        created++;
      } else {
        console.log(`  ⏭️ Announcement: ${announcement.title} already exists`);
        skipped++;
      }
    }

    // ==================== CREATE HELP ARTICLES ====================
    console.log('\n💡 Creating Help Articles...');
    for (const help of defaultContent.helpArticles) {
      const existing = await Content.findOne({ 
        title: help.title, 
        type: 'help' 
      });
      if (!existing) {
        const newHelp = new Content({
          type: 'help',
          title: help.title,
          content: help.content,
          category: help.category,
          isPublished: true,
        });
        await newHelp.save();
        console.log(`  ✅ Help Article: ${help.title}`);
        created++;
      } else {
        console.log(`  ⏭️ Help Article: ${help.title} already exists`);
        skipped++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Default Content Creation Complete!`);
    console.log(`📊 Created: ${created} items`);
    console.log(`⏭️ Skipped: ${skipped} items (already exist)`);
    console.log('='.repeat(60));
    console.log('\n📋 Summary:');
    console.log(`  ❓ FAQs: ${defaultContent.faqs.length}`);
    console.log(`  📖 Documentation: ${defaultContent.documentation.length}`);
    console.log(`  📄 Policies: ${defaultContent.policies.length}`);
    console.log(`  📢 Announcements: ${defaultContent.announcements.length}`);
    console.log(`  💡 Help Articles: ${defaultContent.helpArticles.length}`);
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating default content:', error);
    process.exit(1);
  }
};

createDefaultContent();