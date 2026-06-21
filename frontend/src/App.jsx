// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    // Redirect to login but save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Public Route Component (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    // If user is already logged in, redirect to home
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

// Main App Content with conditional Navbar
function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Define routes where navbar should be hidden
  const hideNavbarRoutes = ['/', '/login', '/register', '/404'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname) && user;
  
  return (
    <div className="min-h-screen">
      {shouldShowNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
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
        
        {/* Protected Routes */}
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
        
        {/* 404 Page - Public (no authentication required) */}
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
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;