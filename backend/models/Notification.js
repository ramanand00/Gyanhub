// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'account_created',
        'email_verified',
        'course_enrollment',
        'course_completion',
        'course_published',
        'course_updated',
        'creator_request_submitted',
        'creator_request_approved',
        'creator_request_rejected',
        'new_lesson',
        'quiz_result',
        'certificate_issued',
        'payment_success',
        'payment_failed',
        'system',
        'admin_message',
        'welcome'
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    link: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '📢',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model("Notification", notificationSchema);