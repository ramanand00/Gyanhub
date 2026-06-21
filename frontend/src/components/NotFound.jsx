// components/NotFound.jsx
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const NotFound = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);
  const mouthRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const updatePupil = (eyeRef, pupilRef) => {
      if (eyeRef.current && pupilRef.current) {
        const eyeRect = eyeRef.current.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;

        const angle = Math.atan2(
          mousePosition.y - eyeCenterY,
          mousePosition.x - eyeCenterX
        );

        const distance = Math.min(
          10,
          Math.sqrt(
            Math.pow(mousePosition.x - eyeCenterX, 2) +
            Math.pow(mousePosition.y - eyeCenterY, 2)
          ) / 25
        );

        const pupilX = Math.cos(angle) * distance;
        const pupilY = Math.sin(angle) * distance;

        pupilRef.current.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
      }
    };

    updatePupil(leftEyeRef, leftPupilRef);
    updatePupil(rightEyeRef, rightPupilRef);
  }, [mousePosition]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      {/* Main Content - Only Laptop with Face */}
      <div className="relative z-10">
        <div className="flex justify-center">
          <div className="relative group">
            {/* Laptop */}
            <div className="relative">
              {/* Screen */}
              <div className="w-80 h-56 sm:w-[420px] sm:h-72 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl relative overflow-hidden border-2 border-gray-700">
                {/* Screen Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-orange-400/5"></div>
                
                {/* Screen Content - Face */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Eyes Container */}
                  <div className="flex items-center space-x-10 sm:space-x-14 mb-3">
                    {/* Left Eye */}
                    <div className="relative" ref={leftEyeRef}>
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full shadow-inner flex items-center justify-center border-2 border-gray-300">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-green-400 to-orange-400 relative overflow-hidden shadow-inner">
                          <div 
                            ref={leftPupilRef}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 bg-gray-900 rounded-full transition-all duration-100 ease-out"
                          >
                            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
                        </div>
                        <div className="absolute top-2 left-2 w-3 h-3 bg-white/40 rounded-full transform rotate-45"></div>
                      </div>
                    </div>

                    {/* Right Eye */}
                    <div className="relative" ref={rightEyeRef}>
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full shadow-inner flex items-center justify-center border-2 border-gray-300">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-green-400 to-orange-400 relative overflow-hidden shadow-inner">
                          <div 
                            ref={rightPupilRef}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 bg-gray-900 rounded-full transition-all duration-100 ease-out"
                          >
                            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
                        </div>
                        <div className="absolute top-2 left-2 w-3 h-3 bg-white/40 rounded-full transform rotate-45"></div>
                      </div>
                    </div>
                  </div>

                  {/* Mouth - Animated Smile */}
                  <div className="relative" ref={mouthRef}>
                    <svg className="w-20 h-12 sm:w-24 sm:h-14" viewBox="0 0 100 60">
                      {/* Smile Path */}
                      <path
                        d="M 15 20 Q 50 50 85 20"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="animate-smile"
                      />
                      {/* Mouth Inner Shadow */}
                      <path
                        d="M 20 22 Q 50 48 80 22"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="animate-smile-delayed"
                      />
                    </svg>
                  </div>
                </div>

                {/* Screen Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-orange-400 to-green-400"></div>
                
                {/* Camera Dot */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-600 rounded-full"></div>
              </div>

              {/* Laptop Base */}
              <div className="mt-[-2px]">
                <div className="w-[22rem] h-4 sm:w-[28rem] sm:h-5 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-2xl mx-auto shadow-xl relative">
                  {/* Keyboard indicator */}
                  <div className="absolute inset-0 flex items-center justify-center px-8">
                    <div className="w-full flex items-center justify-between">
                      <div className="flex space-x-1.5">
                        <div className="w-5 h-1.5 bg-gray-600/30 rounded"></div>
                        <div className="w-5 h-1.5 bg-gray-600/30 rounded"></div>
                        <div className="w-5 h-1.5 bg-gray-600/30 rounded"></div>
                        <div className="w-5 h-1.5 bg-gray-600/30 rounded"></div>
                        <div className="w-5 h-1.5 bg-gray-600/30 rounded"></div>
                      </div>
                      <div className="w-10 h-1.5 bg-green-400/20 rounded"></div>
                      <div className="flex space-x-1.5">
                        <div className="w-5 h-1.5 bg-gray-600/30 rounded"></div>
                        <div className="w-5 h-1.5 bg-gray-600/30 rounded"></div>
                        <div className="w-5 h-1.5 bg-gray-600/30 rounded"></div>
                        <div className="w-5 h-1.5 bg-gray-600/30 rounded"></div>
                        <div className="w-5 h-1.5 bg-gray-600/30 rounded"></div>
                      </div>
                    </div>
                  </div>
                  {/* Trackpad */}
                  <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-gray-600/30 rounded"></div>
                </div>
                <div className="w-24 h-0.5 bg-gray-600 mx-auto rounded-t-sm"></div>
              </div>
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 animate-float">
              <div className="bg-orange-100 rounded-full p-2 shadow-lg border-2 border-orange-200">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 animate-float animation-delay-2000">
              <div className="bg-green-100 rounded-full p-2 shadow-lg border-2 border-green-200">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>

            <div className="absolute top-1/2 -right-8 sm:-right-10 transform -translate-y-1/2 animate-float animation-delay-4000">
              <div className="bg-purple-100 rounded-full p-1.5 shadow-lg border-2 border-purple-200">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/home"
            className="group w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Go Home</span>
          </Link>
          
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>Welcome</span>
          </Link>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes smile {
          0%, 100% { d: path("M 15 20 Q 50 50 85 20"); }
          50% { d: path("M 15 25 Q 50 55 85 25"); }
        }
        
        @keyframes smile-delayed {
          0%, 100% { d: path("M 20 22 Q 50 48 80 22"); }
          50% { d: path("M 20 27 Q 50 53 80 27"); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-smile {
          animation: smile 2s ease-in-out infinite;
        }
        
        .animate-smile-delayed {
          animation: smile-delayed 2s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        
        .animation-delay-4000 {
          animation-delay: 4000ms;
        }
      `}</style>
    </div>
  );
};

export default NotFound;