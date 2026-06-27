// pages/MyCourses.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import CreatorRequest from '../components/CreatorRequest';
import { 
  FiArrowLeft, 
  FiPlus, 
  FiEdit, 
  FiSettings, 
  FiTrash2, 
  FiEye, 
  FiUpload,
  FiAlertCircle,
  FiCheckCircle,
  FiBookOpen,
  FiUsers,
  FiTrendingUp,
  FiClock,
  FiDollarSign,
  FiStar,
  FiChevronRight,
  FiInfo,
  FiPlayCircle
} from 'react-icons/fi';
import { 
  FaSpinner,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaRocket
} from 'react-icons/fa';
import { 
  MdOutlineCategory,
  MdOutlinePayment,
  MdOutlineDiscount 
} from 'react-icons/md';

const MyCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalStudents: 0
  });

  useEffect(() => {
    checkCreatorStatus();
  }, []);

  useEffect(() => {
    if (isCreator) {
      fetchCourses();
    }
  }, [isCreator]);

  const checkCreatorStatus = async () => {
    try {
      const res = await API.get('/api/user/creator-status');
      setIsCreator(res.data.isCreator);
    } catch (error) {
      console.error('Error checking creator status:', error);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/courses/creator-courses');
      const coursesData = res.data.courses;
      setCourses(coursesData);
      
      // Calculate stats
      const published = coursesData.filter(c => c.status === 'published').length;
      const draft = coursesData.filter(c => c.status === 'draft').length;
      const totalStudents = coursesData.reduce((sum, c) => sum + (c.enrollments || 0), 0);
      
      setStats({
        total: coursesData.length,
        published,
        draft,
        totalStudents
      });
    } catch (error) {
      setError('Failed to load courses');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    setDeleting(true);
    try {
      await API.delete(`/api/courses/courses/${courseId}`);
      setShowDeleteModal(null);
      fetchCourses();
    } catch (error) {
      setError('Failed to delete course');
      console.error('Error deleting course:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditCourse = (courseId) => {
    navigate(`/course-builder/${courseId}`);
  };

  const handleEditDetails = (courseId) => {
    navigate(`/course-edit/${courseId}`);
  };

  const handlePublishCourse = async (courseId) => {
    try {
      await API.put(`/api/courses/courses/${courseId}/publish`);
      fetchCourses();
    } catch (error) {
      setError('Failed to publish course');
      console.error('Error publishing course:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      published: 'bg-green-100 text-green-800 border-green-200',
      archived: 'bg-gray-100 text-gray-800 border-gray-200',
      pending: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: '📝',
      published: '✅',
      archived: '📦',
      pending: '⏳',
    };
    return icons[status] || '📌';
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'Draft',
      published: 'Published',
      archived: 'Archived',
      pending: 'Pending',
    };
    return texts[status] || status;
  };

  if (!isCreator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center border-l-4 border-orange-500">
            <div className="text-7xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Become a Creator</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create and publish your own courses. Share your knowledge with thousands of learners.
            </p>
            <CreatorRequest />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
       
        {/* Header with Creator Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              {user?.name ? (
                <span className="text-white text-2xl font-bold">
                  {user.name.charAt(0)}
                </span>
              ) : (
                <FaChalkboardTeacher className="text-white text-2xl" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                My Courses
                <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                  {stats.total} {stats.total === 1 ? 'course' : 'courses'}
                </span>
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <span>👨‍🏫</span> Welcome back, Creator <span className="text-orange-600 font-medium">{user?.name}</span>!
                {stats.published > 0 && ` You have ${stats.published} published course${stats.published > 1 ? 's' : ''}.`}
              </p>
            </div>
          </div>
          <Link
            to="/create-course"
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Create New Course
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-orange-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Courses</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FiBookOpen className="text-2xl text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Published</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.published}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="text-2xl text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-yellow-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.draft}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiEdit className="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-blue-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Students</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUsers className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center space-x-2">
              <FiAlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
                <FaChalkboardTeacher className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-orange-500 text-2xl" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading your courses...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-xl p-12 text-center border-l-4 border-orange-500">
            <div className="text-7xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Courses Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start creating your first course and share your knowledge with the world!
            </p>
            <Link
              to="/create-course"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FiPlus className="w-5 h-5" />
              Create Your First Course
              <FiChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Course Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border-l-4 border-orange-500 hover:border-orange-600 group flex flex-col">
                {/* Thumbnail */}
                <div className="relative overflow-hidden">
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/400x225/059669/ffffff?text=Course'}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Status Badge */}
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(course.status)} shadow-lg backdrop-blur-sm`}>
                    {getStatusIcon(course.status)} {getStatusText(course.status)}
                  </span>
                  
                  {/* Featured Badge */}
                  {course.isFeatured && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                      <FiStar className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                  
                  {/* Discount Badge */}
                  {course.discountPrice && course.discountPrice < course.price && (
                    <span className="absolute bottom-3 right-3 px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                      <MdOutlineDiscount className="w-3 h-3" />
                      {Math.round((1 - course.discountPrice / course.price) * 100)}% OFF
                    </span>
                  )}
                  
                  {/* Bottom Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between text-white text-sm">
                      <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                        <MdOutlineCategory className="w-3 h-3" />
                        {course.category}
                      </span>
                      <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                        <FiClock className="w-3 h-3" />
                        {course.totalLessons || 0} lessons
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Course Info */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg mb-2 hover:text-orange-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {course.shortDescription || course.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <FiUsers className="text-orange-600" />
                        {course.enrollments || 0} students
                      </span>
                      <span className="flex items-center gap-1">
                        <FiTrendingUp className="text-orange-600" />
                        {course.level || 'All levels'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm mb-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg font-bold text-gray-800 flex items-center gap-1">
                        <FiDollarSign className="w-4 h-4 text-orange-600" />
                        {course.price === 0 ? 'Free' : `${course.price}`}
                        {course.discountPrice && course.discountPrice < course.price && (
                          <span className="text-sm text-gray-400 line-through ml-2">${course.discountPrice}</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        📚 {course.totalLessons || 0} lessons
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEditCourse(course._id)}
                      className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1"
                    >
                      <FiEdit className="w-3 h-3" />
                      Edit Content
                    </button>
                    <button
                      onClick={() => handleEditDetails(course._id)}
                      className="px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1"
                    >
                      <FiSettings className="w-3 h-3" />
                      Edit Details
                    </button>
                    
                    {course.status === 'draft' && (
                      <button
                        onClick={() => handlePublishCourse(course._id)}
                        className="col-span-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1"
                      >
                        <FaRocket className="w-3 h-3" />
                        Publish Course
                      </button>
                    )}
                    
                    {course.status === 'published' && (
                      <Link
                        to={`/course/${course._id}`}
                        target="_blank"
                        className="col-span-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1 text-center"
                      >
                        <FiEye className="w-3 h-3" />
                        View Course
                      </Link>
                    )}
                    
                    <button
                      onClick={() => setShowDeleteModal(course)}
                      className="col-span-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1"
                    >
                      <FiTrash2 className="w-3 h-3" />
                      Delete Course
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal - Styled like Contact page */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-l-4 border-red-500 animate-in fade-in zoom-in duration-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrash2 className="text-4xl text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Course</h3>
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete
                </p>
                <p className="font-semibold text-gray-800 mb-4">
                  "{showDeleteModal.title}"?
                </p>
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-6">
                  ⚠️ This action cannot be undone. All lessons and student data will be permanently removed.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(showDeleteModal._id)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <FaSpinner className="animate-spin w-4 h-4" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FiTrash2 className="w-4 h-4" />
                        Delete Course
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;