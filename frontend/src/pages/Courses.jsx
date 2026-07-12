// pages/Courses.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiBook, 
  FiClock, 
  FiStar, 
  FiUsers, 
  FiSearch,
  FiFilter,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiTrendingUp,
  FiAward,
  FiBookOpen,
  FiLayers,
  FiTag,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiEye
} from 'react-icons/fi';
import { 
  FaSpinner,
  FaGraduationCap,
  FaUserCircle,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSortAlphaDown,
  FaSortAlphaUp
} from 'react-icons/fa';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [filters, setFilters] = useState({
    category: 'all',
    level: 'all',
    sort: 'newest',
    search: '',
  });
  const [categories, setCategories] = useState([
    'Development', 'Design', 'Business', 'Marketing', 
    'Data Science', 'AI/ML', 'Cloud', 'DevOps', 'Other'
  ]);
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  useEffect(() => {
    fetchCourses();
  }, [filters.category, filters.level, filters.sort, filters.search, pagination.currentPage]);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/api/courses/published', {
        params: {
          page: pagination.currentPage,
          limit: 12,
          category: filters.category === 'all' ? '' : filters.category,
          level: filters.level === 'all' ? '' : filters.level,
          sort: filters.sort,
          search: filters.search,
        }
      });
      setCourses(res.data.courses);
      setPagination({
        currentPage: res.data.pagination.currentPage,
        totalPages: res.data.pagination.totalPages,
        totalItems: res.data.pagination.totalItems,
      });
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setError(error.response?.data?.message || 'Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, currentPage: page });
  };

  // Get rating stars
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400 text-xs sm:text-sm">★</span>
        ))}
        {halfStar && <span className="text-yellow-400 text-xs sm:text-sm">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300 text-xs sm:text-sm">★</span>
        ))}
        <span className="ml-1 text-xs text-gray-500">({rating || 0})</span>
      </div>
    );
  };

  const getSortLabel = () => {
    switch (filters.sort) {
      case 'newest':
        return 'Newest';
      case 'popular':
        return 'Most Popular';
      case 'rating':
        return 'Highest Rated';
      case 'price-low':
        return 'Price: Low to High';
      case 'price-high':
        return 'Price: High to Low';
      default:
        return 'Sort By';
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center px-4">
          <FaSpinner className="animate-spin h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto" />
          <p className="mt-4 text-gray-600 text-base sm:text-lg font-medium">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50 px-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-l-4 border-red-500 w-full">
          <FiAlertCircle className="text-5xl sm:text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Something Went Wrong</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6">{error}</p>
          <button
            onClick={fetchCourses}
            className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 mx-auto text-sm sm:text-base"
          >
            <FiRefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
        
        {/* Search Bar - Mobile Optimized */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-green-500">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search courses..."
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 hover:border-green-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
              >
                <FiSearch className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>

        {/* Results Header - Mobile Optimized */}
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 bg-white px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-md border-l-4 border-green-500 flex-shrink-0">
            <FiBook className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
              <span className="font-bold text-gray-900">{pagination.totalItems}</span>
              <span className="hidden xs:inline"> courses found</span>
              <span className="xs:hidden"> found</span>
            </span>
            {filters.search && (
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap hidden sm:inline-block">
                "{filters.search}"
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-md border-l-4 border-orange-500 flex-shrink-0">
            <FiFilter className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
            <span className="text-xs text-gray-600 whitespace-nowrap hidden xs:inline">Sort by:</span>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs sm:text-sm font-medium text-gray-800 cursor-pointer py-0.5 sm:py-1 pr-1 sm:pr-6 max-w-[100px] xs:max-w-none"
            >
              <option value="newest">📅 Newest</option>
              <option value="popular">🔥 Popular</option>
              <option value="rating">⭐ Rating</option>
              <option value="price-low">💰 Low</option>
              <option value="price-high">💰 High</option>
            </select>
          </div>
        </div>

        {/* Course Grid - Mobile Optimized */}
        {courses.length === 0 && !loading ? (
          <div className="bg-white rounded-xl shadow-xl p-8 sm:p-12 text-center border-l-4 border-orange-500">
            <FiBookOpen className="text-5xl sm:text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">No Courses Found</h3>
            <p className="text-sm sm:text-base text-gray-600">Try adjusting your filters or search terms.</p>
            <button
              onClick={() => {
                setFilters({ category: 'all', level: 'all', sort: 'newest', search: '' });
                setPagination({ ...pagination, currentPage: 1 });
              }}
              className="mt-4 px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {courses.map((course) => (
              <div 
                key={course._id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 border-l-4 border-green-500 hover:border-green-600 group"
              >
                <Link to={`/course/${course._id}`} className="block">
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={course.thumbnail || 'https://via.placeholder.com/400x225/059669/ffffff?text=Course'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x225/059669/ffffff?text=Course';
                      }}
                    />
                    
                    {/* Badges - Mobile Optimized */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1">
                      {course.isFeatured && (
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-[10px] sm:text-xs font-semibold shadow-lg flex items-center gap-0.5 sm:gap-1">
                          <FiAward className="w-2 h-2 sm:w-3 sm:h-3" />
                          <span className="hidden xs:inline">Featured</span>
                        </span>
                      )}
                      {course.level && (
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg text-[10px] sm:text-xs font-medium shadow-lg">
                          {course.level}
                        </span>
                      )}
                    </div>
                    
                    {course.discountPrice && course.discountPrice < course.price && (
                      <span className="absolute top-2 sm:top-3 right-2 sm:right-3 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-[10px] sm:text-xs font-semibold shadow-lg flex items-center gap-0.5 sm:gap-1">
                        <FiTag className="w-2 h-2 sm:w-3 sm:h-3" />
                        {Math.round((1 - course.discountPrice / course.price) * 100)}% OFF
                      </span>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-3">
                      <div className="flex items-center text-white text-[10px] sm:text-xs gap-2 sm:gap-3">
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <FiBook className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {course.totalLessons || 0} lessons
                        </span>
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <FiClock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {course.duration || 0} min
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="p-3 sm:p-4">
                  <Link to={`/course/${course._id}`} className="block">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2 hover:text-green-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                      {course.shortDescription || course.description}
                    </p>
                  </Link>
                  
                  {/* Instructor - Mobile Optimized */}
                  <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                    {course.instructor?.profilePicture ? (
                      <img 
                        src={course.instructor.profilePicture} 
                        alt={course.instructor.name}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full mr-1.5 sm:mr-2 object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold mr-1.5 sm:mr-2">
                        {course.instructor?.name?.charAt(0) || 'I'}
                      </div>
                    )}
                    <span className="text-[10px] sm:text-xs truncate max-w-[80px] sm:max-w-full">
                      {course.instructor?.name || 'Instructor'}
                    </span>
                  </div>
                  
                  {/* Rating & Students - Mobile Optimized */}
                  <div className="flex items-center justify-between">
                    <div>
                      {course.averageRating > 0 ? (
                        <div className="flex items-center">
                          {renderStars(course.averageRating)}
                        </div>
                      ) : (
                        <span className="text-[10px] sm:text-xs text-gray-400">No ratings</span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1">
                      <FiUsers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      {course.enrollments || 0}
                    </span>
                  </div>

                  {/* Price & Action - Mobile Optimized */}
                  <div className="flex items-center justify-between mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-base sm:text-lg font-bold text-gray-800">
                        {course.price === 0 ? 'Free' : `Rs. ${course.price}`}
                      </span>
                      {course.discountPrice && course.discountPrice < course.price && (
                        <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                          Rs. {course.discountPrice}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/course/${course._id}`}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-0.5 sm:gap-1 group"
                    >
                      <span>View</span>
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform w-3 h-3 sm:w-4 sm:h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination - Mobile Optimized */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-1.5 sm:p-2 inline-flex items-center gap-0.5 sm:gap-1 border-t-2 border-green-500 flex-wrap justify-center">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium text-gray-700 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                Prev
              </button>
              
              {[...Array(pagination.totalPages)].map((_, i) => {
                const page = i + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === pagination.totalPages ||
                  Math.abs(page - pagination.currentPage) <= 1
                ) {
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(page)}
                      className={`px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-all ${
                        pagination.currentPage === page
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-green-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === 2 && pagination.currentPage > 3 ||
                  page === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2
                ) {
                  return <span key={i} className="px-1 sm:px-2 text-gray-400 text-xs sm:text-sm">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium text-gray-700 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;