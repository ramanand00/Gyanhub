// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://gyan-park-qag2.vercel.app',
  'https://www.gajanandmandal.com.np',
  'https://gajanandmandal.com.np',
  'https://gyan-park.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('Blocked origin:', origin);
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Increase payload limit for profile pictures
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.get("/", (req, res) => {
  res.send("GyanPark API Running");
});

// User Routes
app.use("/api/Health", require("./routes/HealthRoutes"));
app.use("/api/auth", require("./routes/AuthRoutes"));
app.use("/api/password", require("./routes/PasswordResetRoutes"));
app.use("/api/settings", require("./routes/SettingsRoutes"));

// Admin Routes
app.use("/api/admin/auth", require("./routes/AdminAuthRoutes"));
app.use("/api/admin", require("./routes/AdminRoutes"));

app.use("/api/user", require("./routes/UserRoutes"));
app.use("/api/courses", require("./routes/CourseRoutes"));
app.use("/api/payment", require("./routes/PaymentRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle payload too large error
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: "File too large. Please upload a smaller image.",
    });
  }
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? "Something went wrong!" : err.message,
  });
});

// For Vercel
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Email mode: ${process.env.ENABLE_EMAIL === 'true' ? 'REAL EMAILS' : 'CONSOLE LOG'}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;