// models/Content.js
const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['faq', 'documentation', 'policy', 'announcement', 'help'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    category: {
      type: String,
      default: 'general',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    version: {
      type: Number,
      default: 1,
    },
    faqData: {
      category: String,
      order: Number,
      isPopular: Boolean,
    },
    policyData: {
      version: String,
      lastUpdated: Date,
    },
    docData: {
      sections: [String],
      tags: [String],
      difficulty: String,
    },
  },
  {
    timestamps: true,
  }
);

contentSchema.index({ title: 'text', content: 'text' });
contentSchema.index({ type: 1, isPublished: 1 });

module.exports = mongoose.model("Content", contentSchema);