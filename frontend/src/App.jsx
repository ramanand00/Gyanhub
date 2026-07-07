// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';

// Admin Pages - Program Management
import Programs from './pages/admin/Programs';
import ProgramSemesters from './pages/admin/ProgramSemesters';
import SemesterBooks from './pages/admin/SemesterBooks';
import BookChapters from './pages/admin/BookChapters';
import ChapterNotes from './pages/admin/ChapterNotes';
import BookOverview from './pages/admin/BookOverview';

// Content Pages
import ProgramDetails from './pages/ProgramDetails';
import SemesterDetails from './pages/SemesterDetails';
import BookDetails from './pages/BookDetails';
import ChapterDetails from './pages/ChapterDetails';

// User Pages
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings';
import Courses from './pages/Courses';
import EditCourse from './pages/EditCourse';
import Notifications from './pages/Notifications';
import MyLearning from './pages/MyLearning';

// Course Pages
import CreateCourse from './pages/CreateCourse';
import CourseBuilder from './pages/CourseBuilder';
import MyCourses from './pages/MyCourses';
import CourseDetails from './pages/CourseDetails';
import CourseLearning from './pages/CourseLearning';

// Payment Pages
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import AdminCourses from './pages/admin/AdminCourses';
import Enrollments from './pages/admin/Enrollments';
import Admins from './pages/admin/Admins';
import CreatorRequests from './pages/admin/CreatorRequests';
import ContentManager from './pages/admin/ContentManager'; 
import ContentList from './pages/admin/ContentList';

// Static Pages
import FAQs from './pages/FAQs';
import Contact from './pages/Contact';
import Documentation from './pages/Documentation';
import Community from './pages/Community';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import Announcements from './pages/Announcements';
import HelpArticles from './pages/HelpArticles';

// Components
import Navbar from './components/Navbar';
import NotFound from './components/NotFound';
import CreatorRequest from './components/CreatorRequest';

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-green-200 rounded-full animate-spin border-t-green-600"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xs">GP</span>
        </div>
      </div>
    </div>
    <p className="mt-4 text-green-600 font-medium animate-pulse">Loading...</p>
  </div>
);

// Admin Loading Component
const AdminLoadingSpinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xs">GP</span>
        </div>
      </div>
    </div>
    <p className="mt-4 text-orange-400 font-medium animate-pulse">Loading Admin Panel...</p>
  </div>
);

// User Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// User Public Route
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

// Admin Protected Route
const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  
  if (loading) {
    return <AdminLoadingSpinner />;
  }
  
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// Admin Public Route
const AdminPublicRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  
  if (loading) {
    return <AdminLoadingSpinner />;
  }
  
  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return children;
};

// Main App Content
function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const { admin } = useAdminAuth();
  
  const hideNavbarRoutes = ['/', '/login', '/register', '/404', '/admin/login'];
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname) && user && !isAdminRoute;
  
  return (
    <div className="min-h-screen flex flex-col">
      {shouldShowNavbar && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          {/* ===== USER ROUTES ===== */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/my-learning" element={<ProtectedRoute><MyLearning /></ProtectedRoute>} />
          
          {/* ===== COURSE ROUTES ===== */}
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:courseId" element={<CourseDetails />} />
          <Route path="/course/:courseId/learn" element={<ProtectedRoute><CourseLearning /></ProtectedRoute>} />
          <Route path="/create-course" element={<ProtectedRoute><CreateCourse /></ProtectedRoute>} />
          <Route path="/course-builder/:courseId" element={<ProtectedRoute><CourseBuilder /></ProtectedRoute>} />
          <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path="/course-edit/:courseId" element={<ProtectedRoute><EditCourse /></ProtectedRoute>} />
          
          {/* ===== PAYMENT ROUTES ===== */}
          <Route path="/payment/:courseId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/payment/failure" element={<ProtectedRoute><PaymentFailure /></ProtectedRoute>} />
          
          {/* ===== CONTENT ROUTES ===== */}
          <Route path="/program/:programId" element={<ProgramDetails />} />
          <Route path="/semester/:semesterId" element={<SemesterDetails />} />
          <Route path="/book/:bookId" element={<BookDetails />} />
          <Route path="/chapter/:chapterId" element={<ChapterDetails />} />
          
          {/* ===== STATIC PAGES ===== */}
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/community" element={<Community />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/help" element={<HelpArticles />} />
          
          {/* ===== AUTH ROUTES ===== */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* ===== ADMIN ROUTES ===== */}
          <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><Dashboard /></AdminProtectedRoute>} />
          <Route path="/admin/users" element={<AdminProtectedRoute><Users /></AdminProtectedRoute>} />
          <Route path="/admin/courses" element={<AdminProtectedRoute><AdminCourses /></AdminProtectedRoute>} />
          <Route path="/admin/enrollments" element={<AdminProtectedRoute><Enrollments /></AdminProtectedRoute>} />
          <Route path="/admin/admins" element={<AdminProtectedRoute><Admins /></AdminProtectedRoute>} />
          <Route path="/admin/creator-requests" element={<AdminProtectedRoute><CreatorRequests /></AdminProtectedRoute>} />
          <Route path="/admin/content" element={<AdminProtectedRoute><ContentManager /></AdminProtectedRoute>} />
          <Route
  path="/admin/content/:type"
  element={
    <AdminProtectedRoute>
      <ContentList />
    </AdminProtectedRoute>
  }
/>
          
          {/* Admin Program Management */}
          <Route path="/admin/programs" element={<AdminProtectedRoute><Programs /></AdminProtectedRoute>} />
          <Route path="/admin/programs/:programId/semesters" element={<AdminProtectedRoute><ProgramSemesters /></AdminProtectedRoute>} />
          <Route path="/admin/semesters/:semesterId/books" element={<AdminProtectedRoute><SemesterBooks /></AdminProtectedRoute>} />
          <Route path="/admin/books/:bookId/chapters" element={<AdminProtectedRoute><BookChapters /></AdminProtectedRoute>} />
          <Route path="/admin/chapters/:chapterId/notes" element={<AdminProtectedRoute><ChapterNotes /></AdminProtectedRoute>} />
          <Route 
  path="/admin/books/:bookId/overview" 
  element={<AdminProtectedRoute><BookOverview /></AdminProtectedRoute>} 
/>

          {/* ===== ERROR ROUTES ===== */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// Root App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
          <AppContent />
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;