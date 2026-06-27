# 🎓 GyanPark - Learning Management System

A full-featured Learning Management System (LMS) built with the MERN stack, offering seamless user experience for both students and administrators.

---

## 🌟 Live Demo

- **Frontend**: [GyanPark](https://gyan-park-qag2.vercel.app)
- **Backend API**: [API Endpoint](https://your-backend-url.vercel.app)
- **Admin Panel**: `/admin/login`

---

## ✨ Features

### 👤 User Features
- **Secure Authentication**
  - Email/Password registration with OTP verification
  - JWT-based authentication
  - Password reset functionality
  - Google OAuth integration

- **User Dashboard**
  - Personalized profile management
  - Course enrollment and progress tracking
  - Achievement badges and learning streaks
  - Recent activity feed

- **Learning Experience**
  - Browse and search courses
  - Course categories and filtering
  - Video lectures and course materials
  - Progress tracking per course
  - Course reviews and ratings

### 🔐 Admin Features
- **Admin Dashboard**
  - Real-time analytics and statistics
  - User registration trends
  - Revenue tracking
  - Recent activities overview

- **User Management**
  - View, search, and filter users
  - Edit user details
  - Verify/Unverify users
  - Delete user accounts

- **Course Management**
  - Create, edit, and delete courses
  - Manage course status (draft/published/archived)
  - Upload thumbnails and course materials
  - Set pricing and discounts
  - Track student enrollments

- **Enrollment Management**
  - View all enrollments
  - Filter by payment status
  - Track student progress
  - Manage payment records

- **Admin Management**
  - Create and manage admin accounts
  - Role-based permissions (Super Admin, Admin, Moderator)
  - Fine-grained permission control
  - Activity logging

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Router v6** - Routing
- **Axios** - HTTP Client
- **React Context** - State Management

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Nodemailer** - Email Service
- **Cloudinary** - Media Storage
- **Bcryptjs** - Password Hashing

---

## 📁 Project Structure
gyanpark/
├── backend/
│ ├── config/
│ │ ├── db.js
│ │ └── cloudinary.js
│ ├── middleware/
│ │ └── auth.js
│ ├── models/
│ │ ├── User.js
│ │ ├── Admin.js
│ │ ├── Course.js
│ │ └── Enrollment.js
│ ├── routes/
│ │ ├── AuthRoutes.js
│ │ ├── AdminAuthRoutes.js
│ │ ├── AdminRoutes.js
│ │ └── HealthRoutes.js
│ ├── services/
│ │ ├── emailService.js
│ │ └── otpService.js
│ ├── scripts/
│ │ └── createSuperAdmin.js
│ ├── server.js
│ ├── .env
│ └── package.json
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Navbar.jsx
│ │ │ ├── NotFound.jsx
│ │ │ └── admin/
│ │ │ └── AdminLayout.jsx
│ │ ├── contexts/
│ │ │ ├── AuthContext.jsx
│ │ │ └── AdminAuthContext.jsx
│ │ ├── pages/
│ │ │ ├── Welcome.jsx
│ │ │ ├── Login.jsx
│ │ │ ├── Register.jsx
│ │ │ ├── Home.jsx
│ │ │ ├── Profile.jsx
│ │ │ └── admin/
│ │ │ ├── AdminLogin.jsx
│ │ │ ├── Dashboard.jsx
│ │ │ ├── Users.jsx
│ │ │ ├── Courses.jsx
│ │ │ ├── Enrollments.jsx
│ │ │ └── Admins.jsx
│ │ ├── services/
│ │ │ └── api.js
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css
│ ├── .env
│ ├── package.json
│ ├── vite.config.js
│ └── vercel.json
└── README.md

text

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account (for media storage)
- Gmail account (for email services)

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/gyanpark.git
cd gyanpark/backend
Install dependencies

bash
npm install
Create .env file

env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SUPER_ADMIN_SECRET=your_super_admin_secret
ENABLE_EMAIL=true
Create Super Admin

bash
npm run create-super-admin
# Or with custom credentials
npm run create-super-admin "admin@gyanpark.com" "Admin Name" "Admin@123456"
Start the backend server

bash
# Development
npm run dev

# Production
npm start
Frontend Setup
Navigate to frontend directory

bash
cd ../frontend
Install dependencies

bash
npm install
Create .env file

env
VITE_API_URL=http://localhost:5000
Start the development server

bash
npm run dev
Deployment
Backend (Vercel)
bash
# In backend directory
npm install -g vercel
vercel
Frontend (Vercel)
bash
# In frontend directory
npm run build
vercel --prod
📱 API Endpoints
User Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/verify-otp	Verify OTP
POST	/api/auth/resend-otp	Resend OTP
POST	/api/auth/login	User login
GET	/api/auth/me	Get current user
Admin Authentication
Method	Endpoint	Description
POST	/api/admin/auth/login	Admin login
GET	/api/admin/auth/me	Get current admin
POST	/api/admin/auth/create-super-admin	Create super admin
Admin Dashboard
Method	Endpoint	Description
GET	/api/admin/dashboard/stats	Get dashboard statistics
User Management
Method	Endpoint	Description
GET	/api/admin/users	Get all users
GET	/api/admin/users/:id	Get single user
PUT	/api/admin/users/:id	Update user
DELETE	/api/admin/users/:id	Delete user
Course Management
Method	Endpoint	Description
GET	/api/admin/courses	Get all courses
GET	/api/admin/courses/:id	Get single course
POST	/api/admin/courses	Create course
PUT	/api/admin/courses/:id	Update course
DELETE	/api/admin/courses/:id	Delete course
Enrollment Management
Method	Endpoint	Description
GET	/api/admin/enrollments	Get all enrollments
Admin Management
Method	Endpoint	Description
GET	/api/admin/admins	Get all admins
POST	/api/admin/admins	Create admin
DELETE	/api/admin/admins/:id	Delete admin
🎨 Database Schema
User Schema
javascript
{
  name: String,
  email: String (unique),
  password: String,
  mobileNumber: String,
  isVerified: Boolean,
  otp: {
    code: String,
    expiresAt: Date
  },
  timestamps: true
}
Admin Schema
javascript
{
  name: String,
  email: String (unique),
  password: String,
  role: ['super_admin', 'admin', 'moderator'],
  isActive: Boolean,
  permissions: {
    manageUsers: Boolean,
    manageCourses: Boolean,
    manageAdmins: Boolean,
    viewAnalytics: Boolean
  },
  lastLogin: Date,
  timestamps: true
}
Course Schema
javascript
{
  title: String,
  description: String,
  category: String,
  level: String,
  instructor: ObjectId (ref: User),
  price: Number,
  discountPrice: Number,
  thumbnail: String,
  videoUrl: String,
  duration: Number,
  lectures: Number,
  students: [{
    userId: ObjectId,
    enrolledAt: Date,
    progress: Number,
    completed: Boolean
  }],
  status: ['draft', 'published', 'archived'],
  isFeatured: Boolean,
  tags: [String],
  prerequisites: [String],
  whatYouWillLearn: [String],
  rating: Number,
  reviews: [{
    userId: ObjectId,
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  timestamps: true
}
Enrollment Schema
javascript
{
  user: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  progress: Number,
  completed: Boolean,
  completedAt: Date,
  paymentStatus: ['pending', 'completed', 'failed', 'refunded'],
  paymentMethod: String,
  amount: Number,
  transactionId: String,
  timestamps: true
}
🎯 Features Breakdown
Authentication Flow
User registers with email, password, and mobile number

OTP sent to registered email

User verifies OTP to activate account

JWT token generated for subsequent requests

Protected routes require valid token

Admin Permissions System
Super Admin: Full access to all features

Admin: Can manage users, courses, and view analytics

Moderator: Limited permissions based on settings

Course Management
Create courses with thumbnails and videos

Set pricing and discount options

Track student enrollments and progress

Manage course status (draft/published/archived)

🔒 Security Features
Password hashing with bcrypt

JWT token authentication

Role-based access control (RBAC)

OTP verification for email validation

CORS configuration for secure API access

Environment variable protection

Input validation and sanitization

📧 Email Service
The platform uses Nodemailer with Gmail for sending:

OTP verification codes

Welcome emails

Password reset links

Course enrollment confirmations

To enable email service:

Enable 2-Factor Authentication in your Gmail

Generate App Password

Add to .env file

🤝 Contributing
We welcome contributions! Please follow these steps:

Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

👥 Authors
Ramanand Mandal - Initial work - Ramanand759

🙏 Acknowledgments
MongoDB for database

Cloudinary for media storage

Vercel for hosting

All open-source libraries used in this project

📞 Support
For support, email mail@riseuptech.com.np or create an issue in the repository.

🚀 Roadmap
Video conferencing integration

Quiz and assessment system

Certificate generation

Mobile application

Payment gateway integration

Live classes feature

Discussion forums

AI-powered course recommendations

📊 Environment Variables Reference
Backend (.env)
Variable	Description	Required
PORT	Server port number	Yes
MONGODB_URI	MongoDB connection string	Yes
JWT_SECRET	JWT secret key	Yes
EMAIL_USER	Gmail address for emails	Yes
EMAIL_PASS	Gmail app password	Yes
CLOUDINARY_CLOUD_NAME	Cloudinary cloud name	Yes
CLOUDINARY_API_KEY	Cloudinary API key	Yes
CLOUDINARY_API_SECRET	Cloudinary API secret	Yes
SUPER_ADMIN_SECRET	Secret for creating super admin	Yes
ENABLE_EMAIL	Enable real email sending	No
CLIENT_URL	Frontend URL for CORS	No
Frontend (.env)
Variable	Description	Required
VITE_API_URL	Backend API URL	Yes
🐛 Known Issues
Email sending may fail in development without proper Gmail configuration

File uploads limited to Cloudinary free tier constraints

Real-time updates require page refresh

📝 Changelog
v1.0.0 (Current)
Initial release

User authentication with OTP

Admin dashboard

Course management

User management

Enrollment tracking

Made with ❤️ by the GyanPark Team

text

This is a complete, production-ready README.md file that you can copy and paste directly into your project. It includes all the essential sections for a professional documentation:
