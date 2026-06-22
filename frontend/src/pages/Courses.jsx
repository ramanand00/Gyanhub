// pages/Courses.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
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
          <span key={`full-${i}`} className="text-yellow-400">★</span>
        ))}
        {halfStar && <span className="text-yellow-400">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">★</span>
        ))}
        <span className="ml-1 text-sm text-gray-500">({rating || 0})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Explore Courses</h1>
          <p className="text-gray-600">Discover courses from expert instructors</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search courses..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-r-lg hover:bg-green-600 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 text-gray-600">
          {pagination.totalItems} {pagination.totalItems === 1 ? 'course' : 'courses'} found
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Courses Found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                <Link to={`/course/${course._id}`} className="block">
                  <div className="relative">
                    <img
                      src={course.thumbnail || 'https://via.placeholder.com/400x225/059669/ffffff?text=Course'}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    {course.isFeatured && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold">
                        Featured
                      </span>
                    )}
                    {course.discountPrice && course.discountPrice < course.price && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
                        {Math.round((1 - course.discountPrice / course.price) * 100)}% OFF
                      </span>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <div className="flex items-center text-white text-sm">
                        <span className="mr-3">📚 {course.totalLessons || 0} lessons</span>
                        <span>⏱️ {course.duration || 0} min</span>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="p-4 flex flex-col flex-1">
                  <Link to={`/course/${course._id}`} className="block flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2 hover:text-green-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {course.shortDescription || course.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="flex items-center">
                        {course.instructor?.profilePicture ? (
                          <img 
                            src={course.instructor.profilePicture} 
                            alt={course.instructor.name}
                            className="w-5 h-5 rounded-full mr-1"
                          />
                        ) : (
                          <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mr-1">
                            {course.instructor?.name?.charAt(0) || 'I'}
                          </span>
                        )}
                        {course.instructor?.name || 'Instructor'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        {course.averageRating > 0 && (
                          <div className="flex items-center">
                            {renderStars(course.averageRating)}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {course.enrollments || 0} students
                      </span>
                    </div>
                  </Link>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-lg font-bold text-gray-800">
                      {course.price === 0 ? 'Free' : `Rs. ${course.price}`}
                      {course.discountPrice && course.discountPrice < course.price && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          Rs. {course.discountPrice}
                        </span>
                      )}
                    </span>
                    <Link
                      to={`/course/${course._id}`}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-colors"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  pagination.currentPage === i + 1
                    ? 'bg-green-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;