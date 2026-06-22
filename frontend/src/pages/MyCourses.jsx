// pages/MyCourses.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CreatorRequest from '../components/CreatorRequest';

const MyCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      setCourses(res.data.courses);
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
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
      pending: 'bg-blue-100 text-blue-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      draft: '📝 Draft',
      published: '✅ Published',
      archived: '📦 Archived',
      pending: '⏳ Pending',
    };
    return texts[status] || status;
  };

  if (!isCreator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Become a Creator</h2>
            <p className="text-gray-600 mb-6">
              Create and publish your own courses. Share your knowledge with thousands of learners.
            </p>
            <CreatorRequest />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
            <p className="text-gray-600">Manage your courses</p>
          </div>
          <Link
            to="/create-course"
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
          >
            + Create New Course
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Courses Yet</h3>
            <p className="text-gray-600 mb-6">Start creating your first course and share your knowledge!</p>
            <Link
              to="/create-course"
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors"
            >
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/400x225/059669/ffffff?text=Course'}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(course.status)}`}>
                    {getStatusText(course.status)}
                  </span>
                  {course.isFeatured && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold">
                      ⭐ Featured
                    </span>
                  )}
                  {course.discountPrice && course.discountPrice < course.price && (
                    <span className="absolute bottom-3 right-3 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
                      {Math.round((1 - course.discountPrice / course.price) * 100)}% OFF
                    </span>
                  )}
                </div>
                
                {/* Course Info */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {course.shortDescription || course.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{course.category}</span>
                      <span>{course.level}</span>
                      <span>{course.enrollments || 0} students</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-lg font-bold text-gray-800">
                        {course.price === 0 ? 'Free' : `Rs. ${course.price}`}
                        {course.discountPrice && course.discountPrice < course.price && (
                          <span className="text-sm text-gray-400 line-through ml-2">Rs. {course.discountPrice}</span>
                        )}
                      </span>
                      <span className="text-sm text-gray-500">
                        📚 {course.totalLessons || 0} lessons
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEditCourse(course._id)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      ✏️ Edit Content
                    </button>
                    <button
                      onClick={() => handleEditDetails(course._id)}
                      className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                    >
                      ⚙️ Edit Details
                    </button>
                    {course.status === 'draft' && (
                      <button
                        onClick={() => handlePublishCourse(course._id)}
                        className="col-span-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                      >
                        🚀 Publish Course
                      </button>
                    )}
                    {course.status === 'published' && (
                      <Link
                        to={`/course/${course._id}`}
                        target="_blank"
                        className="col-span-2 px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors text-center"
                      >
                        👁️ View Course
                      </Link>
                    )}
                    <button
                      onClick={() => setShowDeleteModal(course)}
                      className="col-span-2 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      🗑️ Delete Course
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Course</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete "{showDeleteModal.title}"? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(showDeleteModal._id)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete Course'}
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