// routes/NotificationRoutes.js
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { authenticate } = require("../middleware/auth");

// Get all notifications for current user
router.get("/", authenticate, async (req, res) => {
  try {
    const { limit = 20, page = 1, unreadOnly = false } = req.query;
    
    const query = { user: req.user._id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });
    
    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get unread count
router.get("/unread-count", authenticate, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });
    
    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Mark notification as read
router.put("/:notificationId/read", authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.notificationId,
      user: req.user._id,
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    
    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Mark all notifications as read
router.put("/mark-all-read", authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Delete notification
router.delete("/:notificationId", authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.notificationId,
      user: req.user._id,
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Delete all notifications
router.delete("/delete-all", authenticate, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    
    res.status(200).json({
      success: true,
      message: "All notifications deleted",
    });
  } catch (error) {
    console.error("Delete all notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Create notification (utility function for other routes)
const createNotification = async (userId, type, title, message, data = {}, link = '', icon = '📢') => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      data,
      link,
      icon,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};

// Export the utility function
module.exports = { router, createNotification };