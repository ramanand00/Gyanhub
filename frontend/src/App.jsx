// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';

// User Pages
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Courses from './pages/admin/Courses';
import Enrollments from './pages/admin/Enrollments';
import Admins from './pages/admin/Admins';

// Components
import Navbar from './components/Navbar';
import NotFound from './components/NotFound';

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

// User Public Route (redirects to home if already logged in)
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

// Admin Public Route (redirects to dashboard if already logged in)
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

// Main App Content with conditional Navbar
function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const { admin } = useAdminAuth();
  
  // Define routes where navbar should be hidden
  const hideNavbarRoutes = ['/', '/login', '/register', '/404', '/admin/login', '/admin/dashboard', '/admin/users', '/admin/courses', '/admin/enrollments', '/admin/admins'];
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Show navbar only for user routes with authentication
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname) && user && !isAdminRoute;
  
  return (
    <div className="min-h-screen">
      {shouldShowNavbar && <Navbar />}
      <Routes>
        {/* ===== USER ROUTES ===== */}
        
        {/* Public User Routes */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Welcome />
            </PublicRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Protected User Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        {/* ===== ADMIN ROUTES ===== */}
        
        {/* Public Admin Routes */}
        <Route 
          path="/admin/login" 
          element={
            <AdminPublicRoute>
              <AdminLogin />
            </AdminPublicRoute>
          } 
        />
        
        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <Dashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <Users />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <AdminProtectedRoute>
              <Courses />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/enrollments"
          element={
            <AdminProtectedRoute>
              <Enrollments />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/admins"
          element={
            <AdminProtectedRoute>
              <Admins />
            </AdminProtectedRoute>
          }
        />
        
        {/* ===== ERROR ROUTES ===== */}
        
        {/* 404 Page - Public */}
        <Route path="/404" element={<NotFound />} />
        
        {/* Catch all route - redirect to 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
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