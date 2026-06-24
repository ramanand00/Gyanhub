const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema(
  {
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
    semesterNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    duration: {
      type: String,
      required: true,
    },
    books: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    }],
    totalBooks: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
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

// Ensure unique semester number per program
semesterSchema.index({ programId: 1, semesterNumber: 1 }, { unique: true });

module.exports = mongoose.model("Semester", semesterSchema);