// pages/Welcome.jsx
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-500 to-orange-500 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
        
        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-white/10 rounded-lg animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/3 right-20 w-12 h-12 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-20 w-14 h-14 bg-white/10 rounded-lg animate-float" style={{ animationDelay: '0.8s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-3xl">
        {/* Logo with Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-slow">
              <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center shadow-xl">
                <span className="text-5xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                  GP
                </span>
              </div>
            </div>
            {/* Rotating ring */}
            <div className="absolute -inset-1 rounded-2xl border-2 border-white/30 animate-spin-slow"></div>
          </div>
        </div>

        {/* Title with Animation */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 animate-fade-in-up">
          <span className="inline-block hover:scale-105 transition-transform duration-300">Gyan</span>
          <span className="inline-block text-orange-200 hover:scale-105 transition-transform duration-300">Park</span>
        </h1>

        {/* Subtitle with Animation */}
        <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-xl sm:text-2xl text-white/90 font-light">
            Welcome to the Learning Platform
          </p>
          <div className="flex items-center justify-center space-x-2 text-white/70">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Secure & Verified</span>
            <span className="w-1 h-1 bg-white/30 rounded-full"></span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Learn Anywhere</span>
          </div>
        </div>

        {/* Loading Spinner with Text */}
        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex flex-col items-center space-y-4">
            {/* Animated Loader */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white border-r-orange-300 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
              </div>
            </div>
            
            {/* Loading Text with Dots Animation */}
            <div className="flex items-center space-x-1 text-white/80">
              <span>Loading</span>
              <span className="animate-dot-1">.</span>
              <span className="animate-dot-2">.</span>
              <span className="animate-dot-3">.</span>
            </div>

            {/* Progress Bar */}
            <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-300 to-orange-300 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Text */}
        <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '1s' }}>
          <p className="text-sm text-white/50 font-light tracking-wider">
            © 2024 GyanPark • Empowering Education
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-progress {
          animation: progress 2.5s ease-in-out infinite;
        }
        
        .animate-dot-1, .animate-dot-2, .animate-dot-3 {
          animation: blink 1.4s infinite both;
        }
        
        .animate-dot-2 {
          animation-delay: 0.2s;
        }
        
        .animate-dot-3 {
          animation-delay: 0.4s;
        }
        
        @keyframes blink {
          0%, 20% { opacity: 0; }
          50% { opacity: 1; }
          80%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Welcome;