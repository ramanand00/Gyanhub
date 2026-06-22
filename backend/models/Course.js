// models/Course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      maxlength: 200,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Development", "Design", "Business", "Marketing", "Data Science", "AI/ML", "Cloud", "DevOps", "Other"],
    },
    subCategory: {
      type: String,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
      default: "Beginner",
    },
    price: {
      type: Number,
      default: 0,
    },
    discountPrice: {
      type: Number,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    learningOutcomes: [String],
    prerequisites: [String],
    targetAudience: [String],
    language: {
      type: String,
      default: 'English',
    },
    duration: {
      type: Number,
      default: 0, // in minutes
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    modules: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
    }],
    students: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 0,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,
        certificateUrl: String,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "archived", "pending"],
      default: "draft",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    rating: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [String],
    whatYouWillLearn: [String],
    requirements: [String],
    // Payment related
    isPaid: {
      type: Boolean,
      default: false,
    },
    currency: {
      type: String,
      default: 'NPR',
    },
    // Analytics
    views: {
      type: Number,
      default: 0,
    },
    enrollments: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model("Course", courseSchema);