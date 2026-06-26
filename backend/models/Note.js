const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
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
    content: {
      type: String,
      default: '',
    },
    attachments: [{
      type: {
        type: String,
        enum: ['image', 'pdf', 'video', 'file', 'link'],
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
      },
      name: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
      },
      mimeType: {
        type: String,
      },
    }],
    videoUrl: {
      type: String,
      default: '',
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    links: [{
      title: String,
      url: String,
    }],
    tags: [{
      type: String,
      trim: true,
    }],
    isImportant: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("Note", noteSchema);