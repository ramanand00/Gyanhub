const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: true,
      enum: ["Engineering", "Medical", "Business", "IT", "Arts", "Science", "Commerce", "Other"],
    },
    duration: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    semesters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
    }],
    totalSemesters: {
      type: Number,
      default: 0,
    },
    totalBooks: {
      type: Number,
      default: 0,
    },
    totalChapters: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Program", programSchema);