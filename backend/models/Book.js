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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Book", bookSchema);