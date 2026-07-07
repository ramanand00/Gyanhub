// models/Book.js
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true,
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    bookCover: {
      type: String,
    },
    authors: [{
      type: String,
      trim: true,
    }],
    edition: {
      type: String,
      default: '',
    },
    publisher: {
      type: String,
      default: '',
    },
    isbn: {
      type: String,
      default: '',
    },
    chapters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
    }],
    totalChapters: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    // ===== NEW OVERVIEW FIELDS =====
    overview: {
      university: {
        type: String,
        default: 'Tribhuvan University',
      },
      programType: {
        type: String,
        default: 'Institute of Science and Technology',
      },
      program: {
        type: String,
        default: 'Bachelor of Science in Computer Science and Information Technology',
      },
      courseTitle: {
        type: String,
        default: '',
      },
      courseNumber: {
        type: String,
        default: '',
      },
      semester: {
        type: String,
        default: '',
      },
      natureOfCourse: {
        type: String,
        default: 'Theory + Lab',
      },
      fullMarks: {
        theory: { type: Number, default: 60 },
        practical: { type: Number, default: 20 },
        internal: { type: Number, default: 20 },
      },
      passMarks: {
        theory: { type: Number, default: 24 },
        practical: { type: Number, default: 8 },
        internal: { type: Number, default: 8 },
      },
      creditHours: {
        type: Number,
        default: 3,
      },
      courseDescription: {
        type: String,
        default: '',
      },
      courseObjectives: [{
        type: String,
        trim: true,
      }],
      courseContents: [{
        chapterNumber: { type: Number, required: true },
        chapterName: { type: String, required: true },
        creditHours: { type: Number, default: 0 },
      }],
      // Questions Bank
      questionsBank: [{
        chapter: { type: Number },
        question: { type: String, required: true },
        type: { 
          type: String, 
          enum: ['Theory', 'Numerical', 'Application', 'Multiple Choice', 'Short Answer', 'Long Answer'],
          default: 'Theory' 
        },
        difficulty: { 
          type: String, 
          enum: ['Easy', 'Medium', 'Hard', 'Very Hard'],
          default: 'Medium' 
        },
        answer: { type: String },
        marks: { type: Number, default: 0 },
        year: { type: Number },
        isSolved: { type: Boolean, default: false },
      }],
      // Past Questions
      pastQuestions: [{
        year: { type: Number, required: true },
        semester: { type: String, enum: ['Spring', 'Fall', 'Summer', 'Winter'], default: 'Fall' },
        title: { type: String, required: true },
        questions: { type: Number, default: 0 },
        solved: { type: Boolean, default: false },
        pdfUrl: { type: String },
        description: { type: String },
      }],
      // Practical Sheets
      practicalSheets: [{
        title: { type: String, required: true },
        description: { type: String },
        completed: { type: Boolean, default: false },
        labNumber: { type: Number },
        pdfUrl: { type: String },
        objectives: [String],
        requirements: [String],
      }],
      // Additional Resources
      resources: [{
        title: { type: String, required: true },
        description: { type: String },
        type: { 
          type: String, 
          enum: ['Document', 'Video', 'Link', 'Reference', 'Exercise'],
          default: 'Document' 
        },
        url: { type: String },
        icon: { type: String },
      }],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Book", bookSchema);