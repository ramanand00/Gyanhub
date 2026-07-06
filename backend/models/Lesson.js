// models/Lesson.js
const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['video', 'notes', 'pdf', 'quiz', 'assignment'],
      default: 'video',
    },
    content: {
      videoUrl: {
        type: String,
        default: '',
      },
      notes: {
        type: String,
        default: '',
      },
      pdfUrl: {
        type: String,
        default: '',
      },
      // File upload fields
      files: [{
        filename: String,
        originalName: String,
        url: String,
        type: String,
        size: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      }],
      duration: {
        type: Number,
        default: 0,
      },
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    resources: [{
      name: String,
      url: String,
      type: String,
    }],
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lesson", lessonSchema);