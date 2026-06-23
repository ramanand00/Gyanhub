// scripts/createSuperAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // You can change these values or pass them as command line arguments
    const adminEmail = process.argv[2] || "ramanand@riseuptech.com.np";
    const adminName = process.argv[3] || "Ramanand Mandal";
    const plainPassword = process.argv[4] || "Ramanand//@Admin001//";
    
    const adminData = {
      name: adminName,
      email: adminEmail,
      password: await bcrypt.hash(plainPassword, 10),
      role: "super_admin",
      permissions: {
        manageUsers: true,
        manageCourses: true,
        manageAdmins: true,
        viewAnalytics: true,
      },
      isActive: true,
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("❌ Admin already exists!");
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log("ℹ️  If you forgot the password, you can delete this admin and create a new one.");
      process.exit(0);
    }

    const admin = new Admin(adminData);
    await admin.save();
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ SUPER ADMIN CREATED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`📧 Email:    ${adminData.email}`);
    console.log(`👤 Name:     ${adminData.name}`);
    console.log(`🔑 Password: ${plainPassword}`);
    console.log(`🛡️  Role:     ${adminData.role}`);
    console.log("=".repeat(60));
    console.log("⚠️  IMPORTANT: Please save these credentials securely!");
    console.log("⚠️  Change the password after first login for security.");
    console.log("=".repeat(60) + "\n");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating super admin:", error);
    process.exit(1);
  }
};

createSuperAdmin();