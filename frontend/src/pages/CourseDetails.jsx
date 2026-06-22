// pages/CourseDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, refreshToken } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [instructorFollowers, setInstructorFollowers] = useState(0);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/api/courses/courses/${courseId}`);
      setCourse(res.data.course);
      setIsEnrolled(res.data.course.isEnrolled || false);
      
      // Check if user is following the instructor
      if (user && res.data.course.instructor) {
        try {
          const profileRes = await API.get(`/api/user/profile/${res.data.course.instructor._id}`);
          setFollowing(profileRes.data.user.isFollowing || false);
          setInstructorFollowers(profileRes.data.user.followersCount || 0);
        } catch (err) {
          console.error('Failed to get instructor follow status:', err);
        }
      }
    } catch (error) {
      console.error('Failed to fetch course details:', error);
      if (error.response?.status === 401) {
        try {
          await refreshToken();
          const retryRes = await API.get(`/api/courses/courses/${courseId}`);
          setCourse(retryRes.data.course);
          setIsEnrolled(retryRes.data.course.isEnrolled || false);
        } catch (refreshError) {
          setError('Session expired. Please login again.');
        }
      } else {
        setError(error.response?.data?.message || 'Failed to load course details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollowInstructor = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/course/${courseId}` } });
      return;
    }

    if (!course?.instructor?._id) return;

    setFollowLoading(true);
    try {
      if (following) {
        await API.post(`/api/user/unfollow/${course.instructor._id}`);
        setFollowing(false);
        setInstructorFollowers(prev => prev - 1);
      } else {
        await API.post(`/api/user/follow/${course.instructor._id}`);
        setFollowing(true);
        setInstructorFollowers(prev => prev + 1);
      }
    } catch (error) {
      console.error('Follow action failed:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/course/${courseId}` } });
      return;
    }

    setEnrolling(true);
    setError('');
    setSuccess('');

    try {
      if (!courseId || courseId === 'undefined' || courseId === 'null') {
        setError('Invalid course ID. Please refresh the page and try again.');
        setEnrolling(false);
        return;
      }

      console.log(`📚 Attempting to enroll in course: ${courseId}`);
      
      const res = await API.post(`/api/courses/enroll/${courseId}`);
      
      console.log('✅ Enrollment response:', res.data);

      if (res.data.alreadyEnrolled) {
        setSuccess('You are already enrolled in this course!');
        setIsEnrolled(true);
        setTimeout(() => {
          navigate(`/course/${courseId}/learn`);
        }, 1500);
        return;
      }

      if (res.data.requiresPayment) {
        setSuccess('Redirecting to payment...');
        setTimeout(() => {
          navigate(`/payment/${courseId}`, {
            state: { 
              amount: res.data.amount,
              courseTitle: course.title,
              courseId: courseId
            }
          });
        }, 500);
        return;
      }

      setSuccess('🎉 Successfully enrolled in the course!');
      setIsEnrolled(true);
      setTimeout(() => {
        navigate(`/course/${courseId}/learn`);
      }, 1500);

    } catch (error) {
      console.error('❌ Enrollment error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorData = error.response?.data;
      const statusCode = error.response?.status;
      
      if (statusCode === 400) {
        if (errorData?.code === 'COURSE_NOT_PUBLISHED') {
          setError('This course is not available for enrollment yet.');
        } else if (errorData?.code === 'INVALID_COURSE_ID' || errorData?.code === 'INVALID_OBJECT_ID') {
          setError('Invalid course. Please refresh the page and try again.');
        } else {
          setError(errorData?.message || 'Failed to enroll in course. Please try again.');
        }
      } else if (statusCode === 401) {
        try {
          await refreshToken();
          const retryRes = await API.post(`/api/courses/enroll/${courseId}`);
          if (retryRes.data.requiresPayment) {
            navigate(`/payment/${courseId}`, {
              state: { 
                amount: retryRes.data.amount,
                courseTitle: course.title 
              }
            });
          } else {
            navigate(`/course/${courseId}/learn`);
          }
          return;
        } catch (refreshError) {
          navigate('/login');
        }
      } else if (statusCode === 404) {
        setError('Course not found. It may have been removed.');
      } else {
        setError(errorData?.message || 'Failed to enroll in course. Please try again later.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    setError('');
    setSuccess('');

    try {
      const res = await API.post(`/api/courses/courses/${courseId}/review`, reviewData);
      setSuccess('✅ Review submitted successfully!');
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      
      // Update course with new review
      const updatedCourse = { ...course };
      updatedCourse.reviews = [...(course.reviews || []), res.data.review];
      updatedCourse.averageRating = res.data.averageRating;
      updatedCourse.totalReviews = (course.totalReviews || 0) + 1;
      setCourse(updatedCourse);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400 text-lg">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400 text-lg">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300 text-lg">★</span>
        ))}
      </div>
    );
  };

  const renderStarInput = () => {
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setReviewData({ ...reviewData, rating: star })}
            className={`text-3xl transition-colors ${
              star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/courses" 
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors inline-block"
          >
            Browse Courses →
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Not Available</h2>
          <p className="text-gray-600 mb-6">The course you're looking for is not available.</p>
          <Link 
            to="/courses" 
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors inline-block"
          >
            Browse Courses →
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?._id === course.instructor?._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Messages */}
      {success && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-slide-in">
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        </div>
      )}
      {error && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-slide-in">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm text-green-200 mb-4">
                <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
                <span>›</span>
                <span className="text-white">{course.category}</span>
                <span>›</span>
                <span className="text-white truncate">{course.title}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-green-200 mb-4">
                <span>{course.category}</span>
                <span>•</span>
                <span>{course.level}</span>
                <span>•</span>
                <span>{course.totalLessons || 0} lessons</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-green-100 mb-4">{course.shortDescription || course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4">
                {/* Instructor Info - Clickable */}
                <div className="flex items-center space-x-3">
                  <Link 
                    to={`/profile/${course.instructor?._id}`}
                    className="flex items-center space-x-2 group"
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center overflow-hidden">
                      {course.instructor?.profilePicture ? (
                        <img 
                          src={course.instructor.profilePicture} 
                          alt={course.instructor.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {course.instructor?.name?.charAt(0) || 'I'}
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium group-hover:text-green-200 transition-colors group-hover:underline">
                        {course.instructor?.name || 'Instructor'}
                      </p>
                      <p className="text-xs text-green-200">Instructor</p>
                    </div>
                  </Link>
                  
                  {/* Follow Instructor Button */}
                  {user && !isOwnProfile && course.instructor && (
                    <button
                      onClick={handleFollowInstructor}
                      disabled={followLoading}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${
                        following
                          ? 'bg-green-700/50 text-green-200 hover:bg-green-700'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      } disabled:opacity-50`}
                    >
                      {followLoading ? '...' : following ? '✓ Following' : '+ Follow'}
                    </button>
                  )}
                  {instructorFollowers > 0 && (
                    <span className="text-xs text-green-200">
                      {instructorFollowers} follower{instructorFollowers > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {course.averageRating > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="flex">{renderStars(course.averageRating)}</div>
                    <span className="text-sm text-green-200">
                      ({course.totalReviews || 0} reviews)
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm text-green-200">
                  <span>👥 {course.enrollments || 0} students</span>
                  {course.duration > 0 && <span>⏱️ {course.duration} min</span>}
                </div>
              </div>
            </div>
            
            {/* Course Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-2xl p-6 text-gray-800">
                <div className="mb-4">
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/400x225/059669/ffffff?text=Course'}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    {course.price === 0 ? 'Free' : `Rs. ${course.price}`}
                  </span>
                  {course.discountPrice && course.discountPrice < course.price && (
                    <span className="text-sm text-gray-400 line-through ml-2">Rs. {course.discountPrice}</span>
                  )}
                </div>
                
                {isEnrolled ? (
                  <Link
                    to={`/course/${courseId}/learn`}
                    className="w-full block text-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    📚 Continue Learning
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      course.price === 0 ? '🎓 Enroll Now - Free' : '🛒 Buy Now'
                    )}
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
                  {course.isPaid && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>💳 Secure payment</span>
                      <span>🔄 7-day refund</span>
                    </div>
                  )}
                </div>

                {/* Instructor Mini Profile */}
                {course.instructor && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link 
                      to={`/profile/${course.instructor._id}`}
                      className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {course.instructor.profilePicture ? (
                          <img src={course.instructor.profilePicture} alt={course.instructor.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-sm">{course.instructor.name?.charAt(0) || 'I'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                          {course.instructor.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {course.instructor.totalCourses || 0} courses • {course.instructor.totalStudents || 0} students
                        </p>
                      </div>
                      <span className="text-xs text-green-600 group-hover:underline">View Profile →</span>
                    </Link>
                  </div>
                )}
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
              <h2 className="text-xl font-bold text-gray-800 mb-4">📖 Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{course.description}</p>
            </div>

            {/* What You'll Learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">🎯 What You'll Learn</h2>
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
                <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Learning Outcomes</h2>
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
                <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Prerequisites</h2>
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

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-gray-800">⭐ Reviews</h2>
                {user && isEnrolled && !course.reviews?.some(r => r.userId?._id === user._id) && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    {showReviewForm ? 'Cancel' : 'Write a Review'}
                  </button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Write Your Review</h3>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    {renderStarInput()}
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                    <textarea
                      value={reviewData.comment}
                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Share your experience with this course..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              {course.reviews && course.reviews.length > 0 ? (
                <div className="space-y-4">
                  {course.reviews.slice().reverse().map((review, index) => {
                    const reviewerName = review.userId?.name || 'Anonymous';
                    const reviewerProfilePic = review.userId?.profilePicture || null;
                    const reviewerId = review.userId?._id;
                    
                    return (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            {reviewerProfilePic ? (
                              <img 
                                src={reviewerProfilePic} 
                                alt={reviewerName} 
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {reviewerName.charAt(0)}
                                </span>
                              </div>
                            )}
                            {reviewerId ? (
                              <Link 
                                to={`/profile/${reviewerId}`}
                                className="font-semibold text-gray-800 hover:text-green-600 transition-colors"
                              >
                                {reviewerName}
                              </Link>
                            ) : (
                              <span className="font-semibold text-gray-800">{reviewerName}</span>
                            )}
                          </div>
                          <span className="text-sm text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-1">
                          {renderStars(review.rating)}
                        </div>
                        {review.comment && (
                          <p className="text-gray-600">{review.comment}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Sidebar - Course Content */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📚 Course Content</h3>
              
              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-4">
                  {course.modules.map((module, index) => (
                    <div key={module._id} className="border-b border-gray-100 pb-4 last:border-0">
                      <h4 className="font-semibold text-gray-800">
                        Module {index + 1}: {module.title}
                      </h4>
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
                              {isEnrolled && (
                                <span className="ml-auto text-xs">
                                  {lesson.completed ? '✅' : '⬜'}
                                </span>
                              )}
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

              {isEnrolled && (
                <Link
                  to={`/course/${courseId}/learn`}
                  className="mt-4 w-full block text-center px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors"
                >
                  Continue Learning
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CourseDetails;