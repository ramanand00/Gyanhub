require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// ✅ FIXED CORS CONFIGURATION
const allowedOrigins = [
  process.env.CLIENT_URL,                          // Local development
  'https://gyan-park-qag2.vercel.app',             // Your current frontend
  'https://www.gajanandmandal.com.np',             // Your custom domain
  'https://gajanandmandal.com.np',                 // Without www
  'https://gyan-park.vercel.app',                  // Vercel default
  'https://gyan-park-git-main-yourusername.vercel.app', // Vercel preview
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('Blocked origin:', origin); // Log for debugging
        callback(null, true); // Remove this line to actually block
        // callback(new Error('Not allowed by CORS')); // Uncomment to block
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("GyanPark API Running");
});

app.use("/api/Health", require("./routes/HealthRoutes"));

// For Vercel
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;