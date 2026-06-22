// services/notificationService.js
const Notification = require("../models/Notification");

class NotificationService {
  // Create a notification
  static async create(userId, type, title, message, data = {}, link = '', icon = '📢', priority = 'medium') {
    try {
      const notification = new Notification({
        user: userId,
        type,
        title,
        message,
        data,
        link,
        icon,
        priority,
      });
      await notification.save();
      console.log(`✅ Notification created for user ${userId}: ${title}`);
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  }

  // Create multiple notifications at once
  static async createMany(notifications) {
    try {
      const results = await Notification.insertMany(notifications);
      console.log(`✅ ${results.length} notifications created`);
      return results;
    } catch (error) {
      console.error("Error creating multiple notifications:", error);
      return [];
    }
  }

  // Get unread count for a user
  static async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({
        user: userId,
        isRead: false,
      });
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  // Mark as read
  static async markAsRead(userId, notificationId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return null;
    }
  }

  // Mark all as read
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      return result;
    } catch (error) {
      console.error("Error marking all as read:", error);
      return null;
    }
  }

  // Delete notification
  static async delete(userId, notificationId) {
    try {
      const result = await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId,
      });
      return result;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return null;
    }
  }

  // Delete all for user
  static async deleteAll(userId) {
    try {
      const result = await Notification.deleteMany({ user: userId });
      return result;
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      return null;
    }
  }
}

module.exports = NotificationService;