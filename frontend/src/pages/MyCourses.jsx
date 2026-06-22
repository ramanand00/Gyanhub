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

  useEffect(() => {
    checkCreatorStatus();
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
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await API.delete(`/api/courses/courses/${courseId}`);
      fetchCourses();
    } catch (error) {
      setError('Failed to delete course');
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
            <p className="text-gray-600">Manage your courses</p>
          </div>
          <Link
            to="/create-course"
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors shadow-md hover:shadow-lg"
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
              <div key={course._id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/400x200/059669/ffffff?text=Course'}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(course.status)}`}>
                    {course.status}
                  </span>
                  {course.isFeatured && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold">
                      Featured
                    </span>
                  )}
                </div>
                
                <div className="p-5">
                  <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{course.category}</span>
                    <span>{course.level}</span>
                    <span>{course.enrollments || 0} students</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-800">
                      {course.price === 0 ? 'Free' : `Rs. ${course.price}`}
                      {course.discountPrice && (
                        <span className="text-sm text-gray-400 line-through ml-2">Rs. {course.discountPrice}</span>
                      )}
                    </span>
                    <div className="flex space-x-2">
                      <Link
                        to={`/course-builder/${course._id}`}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;