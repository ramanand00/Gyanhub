const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
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
    chapterNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    whatYouWillLearn: [{
      type: String,
      trim: true,
    }],
    topics: [{
      type: String,
      trim: true,
    }],
    notes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
    }],
    totalNotes: {
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

// Ensure unique chapter number per book
chapterSchema.index({ bookId: 1, chapterNumber: 1 }, { unique: true });

module.exports = mongoose.model("Chapter", chapterSchema);