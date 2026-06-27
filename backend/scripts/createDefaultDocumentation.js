// scripts/createDefaultDocumentation.js
require("dotenv").config();
const mongoose = require("mongoose");
const Content = require("../models/Content");

const defaultDocs = [
  {
    type: 'documentation',
    title: 'Getting Started with GyanPark',
    slug: 'getting-started',
    category: 'Getting Started',
    isPublished: true,
    docData: {
      sections: ['Introduction', 'Features', 'Getting Started'],
      tags: ['beginner', 'overview'],
      difficulty: 'beginner',
      order: 1,
    },
    content: `<h2>Welcome to GyanPark! 🎉</h2>
<p>GyanPark is a comprehensive learning platform designed to provide high-quality educational content. Whether you're a student looking to learn new skills or a creator wanting to share your knowledge, GyanPark has everything you need to succeed.</p>

<h3>Key Features:</h3>
<ul>
<li>📚 Access to programs, semesters, and study materials</li>
<li>🎓 Interactive courses with video lessons and quizzes</li>
<li>📊 Track your learning progress</li>
<li>🏆 Earn certificates upon course completion</li>
<li>👥 Connect with instructors and other learners</li>
</ul>

<h3>Getting Started:</h3>
<ol>
<li>Create your account</li>
<li>Browse available programs and courses</li>
<li>Enroll in courses that interest you</li>
<li>Start learning and track your progress</li>
<li>Earn certificates and showcase your achievements</li>
</ol>`,
  },
  {
    type: 'documentation',
    title: 'Student Guide',
    slug: 'student-guide',
    category: 'Students',
    isPublished: true,
    docData: {
      sections: ['Finding Content', 'Enrolling', 'Progress Tracking', 'Certificates'],
      tags: ['student', 'learning'],
      difficulty: 'beginner',
      order: 2,
    },
    content: `<h2>Student Guide 📚</h2>
<p>Everything you need to know as a student on GyanPark.</p>

<h3>1. Finding Content 🔍</h3>
<p>Browse programs from the home page or use the search feature to find specific courses and materials. You can filter by category, level, and popularity.</p>

<h3>2. Enrolling in Courses ✅</h3>
<p>Click on any course to view details and click "Enroll Now" to start learning. Some courses are free, while others may require payment.</p>

<h3>3. Tracking Progress 📊</h3>
<p>Your progress is automatically tracked as you complete lessons and quizzes. View your learning progress in the "My Learning" section.</p>

<h3>4. Getting Certificates 🏆</h3>
<p>Complete all lessons and quizzes to earn a certificate of completion. Certificates can be downloaded and shared.</p>`,
  },
  {
    type: 'documentation',
    title: 'Creator Guide',
    slug: 'creator-guide',
    category: 'Creators',
    isPublished: true,
    docData: {
      sections: ['Becoming a Creator', 'Creating Courses', 'Publishing', 'Monetizing'],
      tags: ['creator', 'course creation'],
      difficulty: 'intermediate',
      order: 3,
    },
    content: `<h2>Creator Guide 🎓</h2>
<p>Create and publish courses like a pro on GyanPark.</p>

<h3>1. Becoming a Creator 👤</h3>
<p>Apply through Settings → Creator Status. Fill in your expertise and experience. Our team will review your application.</p>

<h3>2. Creating Courses ✏️</h3>
<p>Use the Course Builder to create modules, lessons, and quizzes. Add video content, notes, and assignments.</p>

<h3>3. Publishing Content 📤</h3>
<p>Once your course is ready, publish it to make it available to students. You can update courses after publishing.</p>

<h3>4. Monetizing Courses 💰</h3>
<p>Set prices for your courses and earn revenue from enrollments. Track your earnings and student engagement.</p>`,
  },
  {
    type: 'documentation',
    title: 'Admin Guide',
    slug: 'admin-guide',
    category: 'Administrators',
    isPublished: true,
    docData: {
      sections: ['Dashboard', 'User Management', 'Content Management', 'Analytics'],
      tags: ['admin', 'management'],
      difficulty: 'advanced',
      order: 4,
    },
    content: `<h2>Admin Guide ⚙️</h2>
<p>Manage your platform effectively with these admin features.</p>

<h3>1. Dashboard Overview 📊</h3>
<p>The dashboard provides an overview of platform statistics and activities. Monitor user growth, course enrollments, and revenue.</p>

<h3>2. User Management 👥</h3>
<p>Manage users, verify accounts, and handle creator requests. View user profiles and activity.</p>

<h3>3. Content Management 📝</h3>
<p>Review and manage programs, courses, and other content. Ensure quality and relevance of all materials.</p>

<h3>4. Analytics 📈</h3>
<p>Track platform growth, revenue, and user engagement. Make data-driven decisions to improve the platform.</p>`,
  },
  {
    type: 'documentation',
    title: 'Technical Details',
    slug: 'technical-details',
    category: 'Technical',
    isPublished: true,
    docData: {
      sections: ['Browsers', 'System Requirements', 'File Types'],
      tags: ['technical', 'requirements'],
      difficulty: 'intermediate',
      order: 5,
    },
    content: `<h2>Technical Details 💻</h2>
<p>Technical specifications and requirements for GyanPark.</p>

<h3>Supported Browsers 🌐</h3>
<ul>
<li>✅ Google Chrome (latest)</li>
<li>✅ Mozilla Firefox (latest)</li>
<li>✅ Microsoft Edge (latest)</li>
<li>✅ Safari (latest)</li>
</ul>

<h3>System Requirements 💻</h3>
<ul>
<li>Modern web browser</li>
<li>Stable internet connection</li>
<li>Minimum 4GB RAM recommended</li>
<li>Screen resolution: 1280x720 or higher</li>
</ul>

<h3>Supported File Types 📁</h3>
<ul>
<li>Images: JPG, PNG, GIF, SVG</li>
<li>Documents: PDF, DOC, DOCX</li>
<li>Videos: MP4, WebM</li>
<li>Audio: MP3, WAV</li>
</ul>`,
  },
];

const createDefaultDocumentation = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📚 Connected to MongoDB');

    for (const doc of defaultDocs) {
      const existing = await Content.findOne({ slug: doc.slug });
      if (!existing) {
        const newDoc = new Content(doc);
        await newDoc.save();
        console.log(`✅ Created: ${doc.title}`);
      } else {
        console.log(`⚠️ ${doc.title} already exists, skipping...`);
      }
    }

    console.log('🎉 Default documentation created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating default documentation:', error);
    process.exit(1);
  }
};

createDefaultDocumentation();