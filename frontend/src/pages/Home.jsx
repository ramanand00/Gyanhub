// pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredCourses, setFeaturedCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await API.get('/api/courses/published', {
        params: { limit: 6, sort: 'newest' }
      });
      setCourses(res.data.courses || []);
      
      // Get featured courses
      const featured = res.data.courses?.filter(c => c.isFeatured) || [];
      setFeaturedCourses(featured.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date for member since
  const formatDate = (date) => {
    if (!date) return '2024';
    const d = new Date(date);
    return d.getFullYear();
  };

  // Get random color for course cards
  const getCourseColor = (index) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-red-500 to-red-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to <span className="text-orange-300">GyanPark</span>
            </h1>
            <p className="text-xl text-green-100 mb-6">
              Your gateway to quality education. Learn from expert instructors and advance your career.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/courses"
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl"
              >
                Browse Courses
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        {user && (
          <div className="bg-white rounded-xl shadow-xl p-8 border-l-4 border-orange-500 mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome back, <span className="text-green-600">{user?.name}</span>!
                </h2>
                <p className="text-gray-600">Continue your learning journey with GyanPark.</p>
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-green-700 font-medium">✅ Your account is verified!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-lg font-semibold text-gray-800">
                  {user?.createdAt ? formatDate(user.createdAt) : '2024'}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-orange-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Courses</p>
                <p className="text-lg font-semibold text-gray-800">{courses.length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Courses Section */}
        {featuredCourses.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="text-3xl mr-2">⭐</span> Featured Courses
              </h2>
              <Link to="/courses" className="text-green-600 hover:text-green-700 font-medium">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCourses.map((course, index) => (
                <Link 
                  key={course._id} 
                  to={`/course/${course._id}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative">
                    <img
                      src={course.thumbnail || 'https://via.placeholder.com/400x225/059669/ffffff?text=Course'}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold">
                      Featured
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        {course.price === 0 ? 'Free' : `Rs. ${course.price}`}
                      </span>
                      <span className="text-sm text-gray-500">
                        {course.enrollments || 0} students
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="text-3xl mr-2">📚</span> Latest Courses
            </h2>
            <Link to="/courses" className="text-green-600 hover:text-green-700 font-medium">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Courses Available</h3>
              <p className="text-gray-600">Check back later for new courses from our instructors.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((course) => (
                <Link 
                  key={course._id} 
                  to={`/course/${course._id}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  <div className="relative">
                    <img
                      src={course.thumbnail || 'https://via.placeholder.com/400x225/059669/ffffff?text=Course'}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <div className="flex items-center justify-between text-white text-sm">
                        <span>{course.category}</span>
                        <span>{course.level}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.shortDescription || course.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {course.instructor?.name?.charAt(0) || 'I'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{course.instructor?.name || 'Instructor'}</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {course.price === 0 ? 'Free' : `Rs. ${course.price}`}
                      </span>
                    </div>
                    {course.averageRating > 0 && (
                      <div className="flex items-center mt-2">
                        <span className="text-yellow-400 mr-1">⭐</span>
                        <span className="text-sm text-gray-600">{course.averageRating} ({course.totalReviews || 0} reviews)</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {courses.length > 6 && (
            <div className="text-center mt-8">
              <Link
                to="/courses"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors shadow-md hover:shadow-lg inline-block"
              >
                View All Courses
              </Link>
            </div>
          )}
        </div>

        {/* Quick Links Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/courses"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 text-center group"
          >
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📚</div>
            <h3 className="font-semibold text-gray-800">Browse Courses</h3>
            <p className="text-sm text-gray-500">Explore all available courses</p>
          </Link>
          <Link
            to="/my-learning"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 text-center group"
          >
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📖</div>
            <h3 className="font-semibold text-gray-800">My Learning</h3>
            <p className="text-sm text-gray-500">Continue your courses</p>
          </Link>
          <Link
            to="/profile"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 text-center group"
          >
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">👤</div>
            <h3 className="font-semibold text-gray-800">My Profile</h3>
            <p className="text-sm text-gray-500">View and edit profile</p>
          </Link>
          <Link
            to="/settings"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 text-center group"
          >
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">⚙️</div>
            <h3 className="font-semibold text-gray-800">Settings</h3>
            <p className="text-sm text-gray-500">Manage account settings</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;