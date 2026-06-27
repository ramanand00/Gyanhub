// scripts/createDefaultPolicies.js
require("dotenv").config();
const mongoose = require("mongoose");
const Content = require("../models/Content");

const defaultPolicies = [
  {
    type: 'policy',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    category: 'legal',
    isPublished: true,
    policyData: {
      version: '1.0',
      lastUpdated: new Date(),
    },
    content: `
      <h2>Privacy Policy</h2>
      <p>Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
      <h3>1. Information We Collect</h3>
      <p>We collect information you provide directly to us, such as your name, email address, and mobile number when you create an account. We also collect usage data automatically when you interact with our platform.</p>
      
      <h3>2. How We Use Your Information</h3>
      <p>We use your information to provide and improve our services, process payments, communicate with you, and comply with legal obligations.</p>
      
      <h3>3. Data Security</h3>
      <p>We implement industry-standard security measures to protect your personal information from unauthorized access.</p>
      
      <h3>4. Your Rights</h3>
      <p>You have the right to access, correct, or delete your personal data at any time. You can also opt-out of marketing communications.</p>
      
      <h3>5. Contact Us</h3>
      <p>For privacy-related questions, contact us at privacy@gyanpark.com</p>
    `,
  },
  {
    type: 'policy',
    title: 'Terms of Service',
    slug: 'terms-of-service',
    category: 'legal',
    isPublished: true,
    policyData: {
      version: '1.0',
      lastUpdated: new Date(),
    },
    content: `
      <h2>Terms of Service</h2>
      <p>Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
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
      <p>For questions about these terms, contact us at support@gyanpark.com</p>
    `,
  },
  {
    type: 'policy',
    title: 'Cookies Policy',
    slug: 'cookies-policy',
    category: 'legal',
    isPublished: true,
    policyData: {
      version: '1.0',
      lastUpdated: new Date(),
    },
    content: `
      <h2>Cookies Policy</h2>
      <p>Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
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
      <p>For questions about our cookie usage, contact us at support@gyanpark.com</p>
    `,
  },
];

const createDefaultPolicies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📚 Connected to MongoDB');

    for (const policy of defaultPolicies) {
      const existing = await Content.findOne({ slug: policy.slug });
      if (!existing) {
        const newPolicy = new Content(policy);
        await newPolicy.save();
        console.log(`✅ Created: ${policy.title}`);
      } else {
        console.log(`⚠️ ${policy.title} already exists, skipping...`);
      }
    }

    console.log('🎉 Default policies created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating default policies:', error);
    process.exit(1);
  }
};

createDefaultPolicies();