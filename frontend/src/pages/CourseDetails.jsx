// pages/CourseDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const res = await API.get(`/api/courses/courses/${courseId}`);
      setCourse(res.data.course);
      // Check if user is enrolled
      if (user) {
        const enrolled = res.data.course.students?.some(s => s.userId === user._id);
        setIsEnrolled(enrolled);
      }
    } catch (error) {
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    setError('');

    try {
      const res = await API.post(`/api/courses/enroll/${courseId}`);
      
      if (res.data.requiresPayment) {
        // Redirect to payment
        navigate(`/payment/${courseId}`);
      } else {
        // Free course - redirect to learning
        navigate(`/course/${courseId}/learn`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Not Found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
          <Link to="/courses" className="mt-4 inline-block text-green-600 hover:text-green-700">
            Browse Courses →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 text-sm text-green-200 mb-4">
                <span>{course.category}</span>
                <span>•</span>
                <span>{course.level}</span>
                <span>•</span>
                <span>{course.totalLessons || 0} lessons</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-green-100 mb-4">{course.shortDescription || course.description}</p>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {course.instructor?.name?.charAt(0) || 'I'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{course.instructor?.name || 'Instructor'}</p>
                    <p className="text-xs text-green-200">Instructor</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <span>⭐</span>
                  <span>{course.rating || 0}</span>
                  <span className="text-green-200">({course.reviews?.length || 0} reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-2xl p-6 text-gray-800">
                <div className="mb-4">
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/400x200/059669/ffffff?text=Course'}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    {course.price === 0 ? 'Free' : `Rs. ${course.price}`}
                  </span>
                  {course.discountPrice && (
                    <span className="text-sm text-gray-400 line-through ml-2">Rs. {course.discountPrice}</span>
                  )}
                </div>
                
                {isEnrolled ? (
                  <Link
                    to={`/course/${courseId}/learn`}
                    className="w-full block text-center px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    Continue Learning
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50"
                  >
                    {enrolling ? 'Processing...' : course.price === 0 ? 'Enroll Now' : 'Buy Now'}
                  </button>
                )}
                
                <div className="mt-4 text-sm text-gray-500 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>📚 {course.totalLessons || 0} lessons</span>
                    <span>⏱️ {course.duration || 0} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>👥 {course.enrollments || 0} students</span>
                    <span>📄 Certificate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{course.description}</p>
            </div>

            {/* What You'll Learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">What You'll Learn</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.whatYouWillLearn.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Learning Outcomes */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Learning Outcomes</h2>
                <ul className="space-y-2">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-600">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Prerequisites</h2>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span className="text-gray-600">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar - Course Content */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Course Content</h3>
              
              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-4">
                  {course.modules.map((module, index) => (
                    <div key={module._id} className="border-b border-gray-100 pb-4 last:border-0">
                      <h4 className="font-semibold text-gray-800">Module {index + 1}: {module.title}</h4>
                      <p className="text-sm text-gray-500">{module.lessons?.length || 0} lessons</p>
                      {module.lessons && module.lessons.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {module.lessons.slice(0, 3).map((lesson, lIndex) => (
                            <li key={lesson._id} className="text-sm text-gray-600 flex items-center space-x-2">
                              <span>
                                {lesson.type === 'video' && '🎥'}
                                {lesson.type === 'notes' && '📝'}
                                {lesson.type === 'pdf' && '📄'}
                                {lesson.type === 'quiz' && '📝'}
                                {lesson.type === 'assignment' && '📋'}
                              </span>
                              <span>{lesson.title}</span>
                            </li>
                          ))}
                          {module.lessons.length > 3 && (
                            <li className="text-sm text-green-600">+ {module.lessons.length - 3} more lessons</li>
                          )}
                        </ul>
                      )}
                      {module.quiz && (
                        <div className="mt-2 text-sm text-purple-600">📝 Quiz: {module.quiz.title}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No modules yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;