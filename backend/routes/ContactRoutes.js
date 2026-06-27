// routes/ContactRoutes.js
const express = require("express");
const router = express.Router();
const { optionalAuth } = require("../middleware/auth");
const { sendContactNotificationToAdmin, sendContactConfirmationEmail } = require("../services/emailService");

// ==================== SEND CONTACT MESSAGE ====================
router.post("/contact", optionalAuth, async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // If user is authenticated, use their email and name
    let senderName = name;
    let senderEmail = email;
    let userId = null;
    
    if (req.user) {
      senderName = req.user.name || name;
      senderEmail = req.user.email || email;
      userId = req.user._id;
    }

    // Send notification to admin
    await sendContactNotificationToAdmin(
      senderName,
      senderEmail,
      subject,
      message,
      category,
      userId
    );

    // Send confirmation email to user
    await sendContactConfirmationEmail(
      senderEmail,
      senderName,
      subject,
      category
    );

    res.status(200).json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
});

module.exports = router;