// utils/notificationHelpers.js
const NotificationService = require("../services/notificationService");

class NotificationHelpers {
  // Welcome notification when account is created
  static async welcome(userId, name) {
    return await NotificationService.create(
      userId,
      'welcome',
      '🎉 Welcome to GyanPark!',
      `Hello ${name}! Welcome to GyanPark. Start your learning journey today.`,
      { name },
      '/courses',
      '🎉',
      'high'
    );
  }

  // Email verified
  static async emailVerified(userId, name) {
    return await NotificationService.create(
      userId,
      'email_verified',
      '✅ Email Verified',
      `Your email has been verified successfully, ${name}!`,
      { name },
      '/profile',
      '✅',
      'high'
    );
  }

  // Course enrollment
  static async courseEnrollment(userId, courseTitle, courseId) {
    return await NotificationService.create(
      userId,
      'course_enrollment',
      '📚 Course Enrolled',
      `You have successfully enrolled in "${courseTitle}"`,
      { courseTitle, courseId },
      `/course/${courseId}/learn`,
      '📚',
      'medium'
    );
  }

  // Course completion
  static async courseCompletion(userId, courseTitle, courseId) {
    return await NotificationService.create(
      userId,
      'course_completion',
      '🎉 Course Completed',
      `Congratulations! You have completed "${courseTitle}"`,
      { courseTitle, courseId },
      `/course/${courseId}`,
      '🏆',
      'high'
    );
  }

  // Creator request submitted
  static async creatorRequestSubmitted(userId, name) {
    return await NotificationService.create(
      userId,
      'creator_request_submitted',
      '📝 Creator Request Submitted',
      `Your request to become a creator has been submitted. We'll review it soon.`,
      { name },
      '/settings',
      '📝',
      'medium'
    );
  }

  // Creator request approved
  static async creatorRequestApproved(userId, name) {
    return await NotificationService.create(
      userId,
      'creator_request_approved',
      '🎓 Creator Status Approved',
      `Congratulations ${name}! Your creator request has been approved. You can now create courses.`,
      { name },
      '/my-courses',
      '🎓',
      'high'
    );
  }

  // Creator request rejected
  static async creatorRequestRejected(userId, name, reason) {
    return await NotificationService.create(
      userId,
      'creator_request_rejected',
      '❌ Creator Request Rejected',
      `Your creator request was rejected. ${reason ? `Reason: ${reason}` : 'Please try again later.'}`,
      { name, reason },
      '/settings',
      '❌',
      'high'
    );
  }

  // Quiz result
  static async quizResult(userId, quizTitle, score, passed, moduleId) {
    const emoji = passed ? '🎉' : '📚';
    const title = passed ? 'Quiz Passed!' : 'Quiz Attempted';
    const message = passed 
      ? `You passed "${quizTitle}" with ${score}%!` 
      : `You scored ${score}% on "${quizTitle}". Keep learning!`;
    
    return await NotificationService.create(
      userId,
      'quiz_result',
      `${emoji} ${title}`,
      message,
      { quizTitle, score, passed, moduleId },
      `/course/${moduleId}`,
      emoji,
      passed ? 'high' : 'medium'
    );
  }

  // Payment success
  static async paymentSuccess(userId, courseTitle, amount, courseId) {
    return await NotificationService.create(
      userId,
      'payment_success',
      '💰 Payment Successful',
      `Your payment of Rs. ${amount} for "${courseTitle}" was successful.`,
      { courseTitle, amount, courseId },
      `/course/${courseId}/learn`,
      '💰',
      'high'
    );
  }

  // Payment failed
  static async paymentFailed(userId, courseTitle, amount, error) {
    return await NotificationService.create(
      userId,
      'payment_failed',
      '❌ Payment Failed',
      `Payment of Rs. ${amount} for "${courseTitle}" failed. ${error || 'Please try again.'}`,
      { courseTitle, amount, error },
      '/payment/failure',
      '❌',
      'high'
    );
  }

  // Course published (for creator)
  static async coursePublished(userId, courseTitle, courseId) {
    return await NotificationService.create(
      userId,
      'course_published',
      '📢 Course Published',
      `Your course "${courseTitle}" is now live and available to students!`,
      { courseTitle, courseId },
      `/course/${courseId}`,
      '📢',
      'high'
    );
  }

  // New lesson added (for enrolled students)
  static async newLesson(userId, courseTitle, lessonTitle, courseId) {
    return await NotificationService.create(
      userId,
      'new_lesson',
      '📝 New Lesson Available',
      `New lesson "${lessonTitle}" added to "${courseTitle}"`,
      { courseTitle, lessonTitle, courseId },
      `/course/${courseId}/learn`,
      '📝',
      'medium'
    );
  }

  // Certificate issued
  static async certificateIssued(userId, courseTitle, certificateId) {
    return await NotificationService.create(
      userId,
      'certificate_issued',
      '🏆 Certificate Issued',
      `You have earned a certificate for completing "${courseTitle}"!`,
      { courseTitle, certificateId },
      `/certificate/${certificateId}`,
      '🏆',
      'high'
    );
  }

  // Admin message
  static async adminMessage(userId, message, link = '') {
    return await NotificationService.create(
      userId,
      'admin_message',
      '📨 Admin Message',
      message,
      {},
      link || '/support',
      '📨',
      'high'
    );
  }

  // utils/notificationHelpers.js - Add follow notification
static async followNotification(userId, followerName, followerId) {
  return await NotificationService.create(
    userId,
    'follow',
    `👤 New Follower`,
    `${followerName} started following you`,
    { followerName, followerId },
    `/profile/${followerId}`,
    '👤',
    'medium'
  );
}

  // System notification
  static async systemNotification(userId, title, message, link = '') {
    return await NotificationService.create(
      userId,
      'system',
      `⚙️ ${title}`,
      message,
      {},
      link || '/',
      '⚙️',
      'medium'
    );
  }
}

module.exports = NotificationHelpers;