// models/Enrollment.js
const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "free"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ['esewa', 'khalti', 'free'],
    },
    amount: {
      type: Number,
      default: 0,
    },
    transactionId: {
      type: String,
    },
    // Track module progress
    moduleProgress: [{
      moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
      },
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
      lessonProgress: [{
        lessonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Lesson',
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,
      }],
      quizAttempts: [{
        attempt: {
          type: Number,
          default: 1,
        },
        score: {
          type: Number,
          default: 0,
        },
        passed: {
          type: Boolean,
          default: false,
        },
        attemptedAt: {
          type: Date,
          default: Date.now,
        },
        answers: [{
          questionId: String,
          answer: mongoose.Schema.Types.Mixed,
        }],
      }],
    }],
    certificate: {
      url: String,
      issuedAt: Date,
      certificateId: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);