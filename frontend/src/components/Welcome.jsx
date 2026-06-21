// components/Welcome.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        if (user) {
          navigate('/home');
        } else {
          navigate('/login');
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4 animate-bounce">GyanPark</h1>
        <p className="text-xl">Welcome to the Learning Platform</p>
        <div className="mt-8">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;