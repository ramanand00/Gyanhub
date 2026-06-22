// scripts/cleanTokens.js
const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const cleanExpiredTokens = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const result = await User.updateMany(
      { 
        refreshTokenExpires: { $lt: new Date() },
        refreshToken: { $ne: null }
      },
      { 
        $set: { 
          refreshToken: null,
          refreshTokenExpires: null 
        } 
      }
    );
    
    console.log(`✅ Cleaned ${result.modifiedCount} expired refresh tokens`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error cleaning tokens:", error);
    process.exit(1);
  }
};

cleanExpiredTokens();