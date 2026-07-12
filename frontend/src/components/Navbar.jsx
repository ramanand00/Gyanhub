// components/Navbar.jsx - Optimized for Mobile without Hamburger Menu
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import logo from '../assets/logo.png';
import NotificationDropdown from './NotificationDropdown';
import { FiHome, FiBook, FiBookOpen, FiUser, FiSettings, FiGrid, FiLogOut, FiBell } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [mobileNavAtTop, setMobileNavAtTop] = useState(false);
  const dropdownRef = useRef(null);
  const mobileAccountButtonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideDesktopDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
      const clickedInsideMobileDropdown = mobileAccountButtonRef.current && mobileAccountButtonRef.current.contains(event.target);

      if (!clickedInsideDesktopDropdown && !clickedInsideMobileDropdown) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const shouldHideTopBar = window.scrollY > 80;
      setShowTopBar(!shouldHideTopBar);
      setMobileNavAtTop(shouldHideTopBar);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getUserInitials = (name = '') => {
    const trimmedName = name?.trim() || '';
    if (!trimmedName) return 'U';

    const parts = trimmedName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const userInitials = getUserInitials(user?.name);

  // Navigation items for mobile bottom bar
  const mobileNavItems = [
    { path: '/home', icon: FiHome, label: 'Home' },
    { path: '/courses', icon: FiBook, label: 'Courses' },
    // { path: '/my-learning', icon: FiBookOpen, label: 'Learning' },
    { path: '/notifications', icon: FiBell, label: 'Notifications' },
  ];

  // Add My Courses for creators
  if (user?.isCreator) {
    mobileNavItems.splice(2, 0, { path: '/my-courses', icon: FiGrid, label: 'My Courses' });
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:block bg-gradient-to-r from-green-600 via-green-700 to-green-800 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <Link to="/home" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-200 overflow-hidden p-1">
                    <img 
                      src={logo} 
                      alt="GyanPark Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white tracking-tight">GyanPark</span>
                  <span className="text-[10px] text-green-200 tracking-wider uppercase">Learning Platform</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-1">
              <Link
                to="/home"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/home')
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-green-100 hover:bg-white/10 hover:text-white hover:scale-105'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <FiHome className="w-4 h-4" />
                  <span>Home</span>
                </span>
              </Link>
              
              <Link
                to="/courses"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/courses')
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-green-100 hover:bg-white/10 hover:text-white hover:scale-105'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <FiBook className="w-4 h-4" />
                  <span>Courses</span>
                </span>
              </Link>

              <Link
                to="/my-learning"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/my-learning')
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-green-100 hover:bg-white/10 hover:text-white hover:scale-105'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <FiBookOpen className="w-4 h-4" />
                  <span>My Learning</span>
                </span>
              </Link>

              {user?.isCreator && (
                <Link
                  to="/my-courses"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/my-courses')
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-green-100 hover:bg-white/10 hover:text-white hover:scale-105'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <FiGrid className="w-4 h-4" />
                    <span>My Courses</span>
                  </span>
                </Link>
              )}

              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/profile')
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-green-100 hover:bg-white/10 hover:text-white hover:scale-105'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <FiUser className="w-4 h-4" />
                  <span>Profile</span>
                </span>
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <NotificationDropdown />

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 text-white hover:text-green-100 transition-colors duration-200 group"
                >
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full hover:bg-white/20 transition-all duration-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user?.name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-bold">
                          {userInitials}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium hidden lg:block">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black ring-opacity-5 transform origin-top-right transition-all duration-200">
                    <div className="px-4 py-4 bg-gradient-to-r from-green-50 to-orange-50 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                          {user?.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user?.name || 'User'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-lg font-bold">
                              {userInitials}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          {user?.isCreator && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                              Creator
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                      >
                        <FiUser className="w-5 h-5 mr-3 text-gray-400" />
                        My Profile
                      </Link>
                      
                      <Link
                        to="/my-learning"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                      >
                        <FiBookOpen className="w-5 h-5 mr-3 text-gray-400" />
                        My Learning
                      </Link>
                      
                      {user?.isCreator && (
                        <Link
                          to="/my-courses"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                        >
                          <FiGrid className="w-5 h-5 mr-3 text-gray-400" />
                          My Courses
                        </Link>
                      )}
                      
                      <Link
                        to="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                      >
                        <FiSettings className="w-5 h-5 mr-3 text-gray-400" />
                        Settings
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className={`md:hidden fixed ${mobileNavAtTop ? 'top-0' : 'top-14'} left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200 transition-all duration-300`}>
        <div className="flex items-center justify-around px-2 py-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsDropdownOpen(false)}
                className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all duration-200 relative ${
                  active 
                    ? 'text-green-600' 
                    : 'text-gray-500 hover:text-green-500'
                }`}
              >
                {active && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-green-500 to-orange-500 rounded-full"></div>
                )}
                <div className={`p-1.5 rounded-full transition-all duration-200 ${
                  active ? 'bg-green-50' : ''
                }`}>
                  <Icon className={`w-5 h-5 ${
                    active ? 'text-green-600' : 'text-gray-500'
                  }`} />
                </div>
                <span className={`text-[10px] font-medium mt-0.5 ${
                  active ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* User Avatar with Dropdown */}
          <div className="relative" ref={mobileAccountButtonRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex flex-col items-center py-1 px-3 rounded-xl transition-all duration-200"
            >
              <div className={`p-0.5 rounded-full transition-all duration-200 ${
                isDropdownOpen ? 'ring-2 ring-green-500' : ''
              }`}>
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user?.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xs font-bold">
                      {userInitials}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-medium text-gray-500 mt-0.5">Account</span>
            </button>

            {/* Mobile Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-14 right-0 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black ring-opacity-5">
                <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-orange-50 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                  >
                    <FiUser className="w-4 h-4 mr-3 text-gray-400" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                  >
                    <FiSettings className="w-4 h-4 mr-3 text-gray-400" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      // Handle logout
                      setIsDropdownOpen(false);
                      // Your logout logic here
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <FiLogOut className="w-4 h-4 mr-3 text-red-400" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Spacer to prevent content from hiding behind nav bars */}
      <div className={`md:hidden ${mobileNavAtTop ? 'h-16' : 'h-30'}`}></div>

      {/* Mobile Top Bar with Logo and Notifications */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 via-green-700 to-green-800 shadow-xl transition-transform duration-300 ${showTopBar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center justify-between px-4 py-2.5">
          <Link to="/home" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg overflow-hidden p-1">
              <img 
                src={logo} 
                alt="GyanPark Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight">GyanPark</span>
              <span className="text-[8px] text-green-200 tracking-wider uppercase">Learning Platform</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-2"></div>
        </div>
      </div>
    </>
  );
};

export default Navbar;