// models/Assignment.js
const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
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
      required: true,
    },
    instructions: {
      type: String,
      default: '',
    },
    resources: [{
      name: String,
      url: String,
    }],
    maxScore: {
      type: Number,
      default: 100,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Assignment", assignmentSchema);