// models/Quiz.js
const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
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
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: [
          {
            text: String,
            isCorrect: Boolean,
          }
        ],
        type: {
          type: String,
          enum: ['single', 'multiple', 'truefalse'],
          default: 'single',
        },
        points: {
          type: Number,
          default: 1,
        },
        explanation: {
          type: String,
          default: '',
        },
      }
    ],
    passingScore: {
      type: Number,
      default: 70, // 70%
    },
    timeLimit: {
      type: Number,
      default: 0, // in minutes, 0 = no limit
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quiz", quizSchema);