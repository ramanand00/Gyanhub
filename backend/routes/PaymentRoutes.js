// routes/PaymentRoutes.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

// eSewa Payment
router.post("/esewa/initiate", authenticate, async (req, res) => {
  try {
    const { courseId } = req.body;
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
    const transactionUuid = `GYANPARK_${Date.now()}_${req.user._id}`;

    // eSewa payment data
    const paymentData = {
      amount: amount,
      tax_amount: 0,
      total_amount: amount,
      transaction_uuid: transactionUuid,
      product_code: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success`,
      failure_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/failure`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
    };

    // Generate signature
    const secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
    const signatureString = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(signatureString)
      .digest('base64');

    paymentData.signature = signature;

    // Save pending enrollment
    const enrollment = new Enrollment({
      user: req.user._id,
      course: course._id,
      paymentStatus: 'pending',
      amount: amount,
      transactionId: transactionUuid,
      paymentMethod: 'esewa',
    });
    await enrollment.save();

    res.status(200).json({
      success: true,
      paymentData,
      esewaUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
    });
  } catch (error) {
    console.error("eSewa initiate error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// eSewa Payment Success
router.post("/esewa/success", async (req, res) => {
  try {
    const { data } = req.body;

    // Verify the payment with eSewa
    const verificationResponse = await axios.post(
      'https://rc-epay.esewa.com.np/api/epay/main/v2/form/status',
      {
        product_code: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
        total_amount: data.total_amount,
        transaction_uuid: data.transaction_uuid,
      }
    );

    if (verificationResponse.data.status === 'complete') {
      // Find enrollment
      const enrollment = await Enrollment.findOne({
        transactionId: data.transaction_uuid,
      });

      if (enrollment) {
        enrollment.paymentStatus = 'completed';
        await enrollment.save();

        // Add student to course
        const course = await Course.findById(enrollment.course);
        if (course) {
          course.students.push({
            userId: enrollment.user,
            enrolledAt: new Date(),
          });
          course.enrollments += 1;
          await course.save();
        }

        // Redirect to course
        return res.redirect(`${process.env.CLIENT_URL}/course/${enrollment.course}/learn`);
      }
    }

    res.redirect(`${process.env.CLIENT_URL}/payment/failure`);
  } catch (error) {
    console.error("eSewa success error:", error);
    res.redirect(`${process.env.CLIENT_URL}/payment/failure`);
  }
});

// Khalti Payment
router.post("/khalti/initiate", authenticate, async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const amount = (course.discountPrice || course.price) * 100; // Khalti expects paisa

    // Khalti payment data
    const paymentData = {
      return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success`,
      website_url: process.env.CLIENT_URL || 'http://localhost:5173',
      amount: amount,
      purchase_order_id: `GYANPARK_${Date.now()}`,
      purchase_order_name: course.title.substring(0, 50),
    };

    // Save pending enrollment
    const enrollment = new Enrollment({
      user: req.user._id,
      course: course._id,
      paymentStatus: 'pending',
      amount: course.discountPrice || course.price,
      transactionId: paymentData.purchase_order_id,
      paymentMethod: 'khalti',
    });
    await enrollment.save();

    res.status(200).json({
      success: true,
      paymentData,
      khaltiUrl: 'https://khalti.com/api/v2/epayment/initiate/',
    });
  } catch (error) {
    console.error("Khalti initiate error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Khalti Payment Verification
router.post("/khalti/verify", authenticate, async (req, res) => {
  try {
    const { token, amount, transactionId } = req.body;

    const response = await axios.post(
      'https://khalti.com/api/v2/epayment/lookup/',
      {
        token: token,
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );

    if (response.data.status === 'completed') {
      const enrollment = await Enrollment.findOne({
        transactionId: response.data.purchase_order_id,
      });

      if (enrollment) {
        enrollment.paymentStatus = 'completed';
        enrollment.transactionId = response.data.transaction_id;
        await enrollment.save();

        // Add student to course
        const course = await Course.findById(enrollment.course);
        if (course) {
          course.students.push({
            userId: enrollment.user,
            enrolledAt: new Date(),
          });
          course.enrollments += 1;
          await course.save();
        }
      }

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
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

// Payment failure
router.get("/payment/failure", (req, res) => {
  res.status(200).json({
    success: false,
    message: "Payment failed. Please try again.",
  });
});

module.exports = router;