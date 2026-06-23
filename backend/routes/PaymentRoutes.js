// routes/PaymentRoutes.js
const express = require("express");
const router = express.Router();
const CryptoJS = require("crypto-js");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");
const NotificationHelpers = require("../utils/notificationHelpers");

const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || "";
const KHALTI_PUBLIC_KEY = process.env.KHALTI_PUBLIC_KEY || "";

// Store transactions temporarily (in production, use a database)
const transactions = {};

// Helper: Generate eSewa signature
function signEsewaSignature({ total_amount, transaction_uuid, product_code }) {
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  const hash = CryptoJS.HmacSHA256(message, ESEWA_SECRET_KEY);
  return CryptoJS.enc.Base64.stringify(hash);
}

// Helper: Generate transaction UUID
function generateTransactionId() {
  return `GYANPARK-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ==================== INITIATE PAYMENT ====================
router.post("/initiate", authenticate, async (req, res) => {
  try {
    const { courseId, method = 'esewa' } = req.body;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    const amount = course.discountPrice || course.price;
    const transactionId = generateTransactionId();

    // Save pending enrollment
    const enrollment = new Enrollment({
      user: req.user._id,
      course: course._id,
      paymentStatus: 'pending',
      amount: amount,
      transactionId: transactionId,
      paymentMethod: method,
    });
    await enrollment.save();

    if (method === 'esewa') {
      // eSewa Payment Initiation
      const paymentData = {
        amount: amount,
        tax_amount: 0,
        total_amount: amount,
        transaction_uuid: transactionId,
        product_code: ESEWA_MERCHANT_ID,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success`,
        failure_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/failure`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
      };

      // Generate signature
      const signature = signEsewaSignature({
        total_amount: paymentData.total_amount,
        transaction_uuid: paymentData.transaction_uuid,
        product_code: paymentData.product_code,
      });

      paymentData.signature = signature;

      res.status(200).json({
        success: true,
        method: 'esewa',
        paymentData,
        esewaUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
        enrollmentId: enrollment._id,
        transactionId: transactionId,
      });
    } else if (method === 'khalti') {
      // Khalti Payment Initiation
      const khaltiAmount = amount * 100; // Khalti expects amount in paisa

      const paymentData = {
        return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success`,
        website_url: process.env.CLIENT_URL || 'http://localhost:5173',
        amount: khaltiAmount,
        purchase_order_id: transactionId,
        purchase_order_name: course.title.substring(0, 50),
      };

      res.status(200).json({
        success: true,
        method: 'khalti',
        paymentData,
        khaltiUrl: 'https://khalti.com/api/v2/epayment/initiate/',
        enrollmentId: enrollment._id,
        transactionId: transactionId,
        publicKey: KHALTI_PUBLIC_KEY,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported payment method",
      });
    }
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

// ==================== VERIFY PAYMENT (eSewa) ====================
router.post("/esewa/verify", authenticate, async (req, res) => {
  try {
    const { transaction_uuid, total_amount, product_code, status } = req.body;

    if (status === 'COMPLETE') {
      // Find the enrollment
      const enrollment = await Enrollment.findOne({
        transactionId: transaction_uuid,
        user: req.user._id,
        paymentStatus: 'pending',
      });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: "Enrollment not found or already processed",
        });
      }

      // Update enrollment
      enrollment.paymentStatus = 'completed';
      await enrollment.save();

      // Add student to course
      const course = await Course.findById(enrollment.course);
      if (course) {
        course.students.push({
          userId: enrollment.user,
          enrolledAt: new Date(),
        });
        course.enrollments = (course.enrollments || 0) + 1;
        await course.save();

        // Send notification
        await NotificationHelpers.paymentSuccess(
          enrollment.user,
          course.title,
          enrollment.amount,
          course._id
        );
      }

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        enrollment,
        course: {
          _id: course._id,
          title: course.title,
        },
      });
    } else {
      // Payment failed
      const enrollment = await Enrollment.findOne({
        transactionId: transaction_uuid,
        user: req.user._id,
      });

      if (enrollment) {
        enrollment.paymentStatus = 'failed';
        await enrollment.save();
      }

      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("eSewa verify error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==================== VERIFY PAYMENT (Khalti) ====================
router.post("/khalti/verify", authenticate, async (req, res) => {
  try {
    const { token, amount, transactionId, status } = req.body;

    // In production, verify with Khalti API
    // For now, we'll trust the frontend response

    if (status === 'COMPLETE') {
      const enrollment = await Enrollment.findOne({
        transactionId: transactionId,
        user: req.user._id,
        paymentStatus: 'pending',
      });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: "Enrollment not found or already processed",
        });
      }

      enrollment.paymentStatus = 'completed';
      await enrollment.save();

      const course = await Course.findById(enrollment.course);
      if (course) {
        course.students.push({
          userId: enrollment.user,
          enrolledAt: new Date(),
        });
        course.enrollments = (course.enrollments || 0) + 1;
        await course.save();

        await NotificationHelpers.paymentSuccess(
          enrollment.user,
          course.title,
          enrollment.amount,
          course._id
        );
      }

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        enrollment,
        course: {
          _id: course._id,
          title: course.title,
        },
      });
    } else {
      const enrollment = await Enrollment.findOne({
        transactionId: transactionId,
        user: req.user._id,
      });

      if (enrollment) {
        enrollment.paymentStatus = 'failed';
        await enrollment.save();
      }

      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Khalti verify error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==================== GET PAYMENT STATUS ====================
router.get("/status/:transactionId", authenticate, async (req, res) => {
  try {
    const { transactionId } = req.params;

    const enrollment = await Enrollment.findOne({
      transactionId: transactionId,
      user: req.user._id,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      enrollment,
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==================== GENERATE SIGNATURE (for testing) ====================
router.post("/signature", (req, res) => {
  try {
    const { total_amount, transaction_uuid, product_code } = req.body;

    if (!total_amount || !transaction_uuid || !product_code) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const signature = signEsewaSignature({
      total_amount,
      transaction_uuid,
      product_code,
    });

    res.status(200).json({
      success: true,
      signature,
      signed_field_names: "total_amount,transaction_uuid,product_code",
    });
  } catch (error) {
    console.error("Signature generation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;