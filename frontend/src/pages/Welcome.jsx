// pages/Welcome.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

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
        
        {/* Enhanced Floating Shapes */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-white/10 rounded-lg animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/3 right-20 w-12 h-12 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-20 w-14 h-14 bg-white/10 rounded-lg animate-float" style={{ animationDelay: '0.8s' }}></div>
        
        {/* New Floating Particles */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-orange-200/30 rounded-full animate-ping" style={{ animationDelay: '0.7s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-green-200/30 rounded-full animate-ping" style={{ animationDelay: '1.2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
        {/* Enhanced Logo with Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            {/* Outer Glow Ring */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-orange-400/20 to-green-300/20 blur-xl animate-pulse-slow"></div>
            
            {/* Main Logo Container */}
            <div className="relative w-36 h-36 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl animate-float-slow border border-white/20">
              <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center shadow-xl overflow-hidden transition-transform duration-500 group-hover:scale-105">
                <img 
                  src={logo} 
                  alt="GyanPark" 
                  className="w-full h-full object-contain p-3"
                />
              </div>
            </div>
            
            {/* Rotating Rings */}
            <div className="absolute -inset-2 rounded-3xl border-2 border-white/20 animate-spin-slow"></div>
            <div className="absolute -inset-6 rounded-3xl border border-white/10 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '12s' }}></div>
            
            {/* Sparkle Effects */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-300 rounded-full animate-pulse shadow-lg shadow-orange-300/50"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-300 rounded-full animate-pulse shadow-lg shadow-green-300/50" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        {/* Brand Name with Elegant Animation */}
        <div className="space-y-2 animate-fade-in-up">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white tracking-tight">
            <span className="inline-block hover:scale-105 transition-transform duration-300 drop-shadow-2xl">Gyan</span>
            <span className="inline-block text-orange-200 hover:scale-105 transition-transform duration-300 drop-shadow-2xl">Park</span>
          </h1>
          <div className="flex items-center justify-center gap-3 text-white/60">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/30"></div>
            <span className="text-sm font-light tracking-[0.3em] uppercase">Learn • Grow • Succeed</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/30"></div>
          </div>
        </div>

        {/* Minimal Loading Indicator */}
        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex flex-col items-center gap-6">
            {/* Elegant Spinner */}
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-3 border-white/10 border-t-white border-r-orange-300 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-white/5 backdrop-blur-sm animate-pulse"></div>
              </div>
            </div>
            
            {/* Sleek Progress Bar */}
            <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-300 via-white to-orange-300 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes progress {
          0% { width: 0%; opacity: 0.5; }
          50% { width: 70%; opacity: 1; }
          100% { width: 100%; opacity: 0.5; }
        }
        
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        
        .animate-progress {
          animation: progress 2.5s ease-in-out infinite;
        }
        
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
};

export default Welcome;