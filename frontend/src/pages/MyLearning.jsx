// pages/MyLearning.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyLearning = () => {
  const { user } = useAuth();
  const [paidEnrollments, setPaidEnrollments] = useState([]);
  const [freeEnrollments, setFreeEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/courses/my-courses');
      const allEnrollments = res.data.enrollments;
      
      // Separate paid and free courses
      const paid = allEnrollments.filter(
        enrollment => enrollment.paymentStatus === 'completed' || enrollment.amount > 0
      );
      const free = allEnrollments.filter(
        enrollment => enrollment.paymentStatus === 'free' || enrollment.amount === 0
      );
      
      setPaidEnrollments(paid);
      setFreeEnrollments(free);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      setError('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getPaymentBadge = (enrollment) => {
    if (enrollment.paymentStatus === 'completed') {
      return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">💰 Paid</span>;
    } else if (enrollment.paymentStatus === 'free') {
      return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">🎁 Free</span>;
    }
    return null;
  };

  const renderCourseCard = (enrollment) => (
    <div key={enrollment._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      <Link to={`/course/${enrollment.course?._id}/learn`}>
        <div className="relative">
          <img
            src={enrollment.course?.thumbnail || 'https://via.placeholder.com/400x225/059669/ffffff?text=Course'}
            alt={enrollment.course?.title}
            className="w-full h-48 object-cover"
          />
          {enrollment.completed && (
            <span className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
              ✅ Completed
            </span>
          )}
          <div className="absolute top-3 left-3">
            {getPaymentBadge(enrollment)}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <div className="flex items-center justify-between text-white text-sm">
              <span>📚 {enrollment.course?.totalLessons || 0} lessons</span>
              <span>🎯 {enrollment.progress || 0}%</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <Link to={`/course/${enrollment.course?._id}/learn`}>
          <h3 className="font-semibold text-gray-800 text-lg mb-2 hover:text-green-600 transition-colors line-clamp-2">
            {enrollment.course?.title || 'Course'}
          </h3>
        </Link>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span className="flex items-center">
            👨‍🏫 {enrollment.course?.instructor?.name || 'Instructor'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-gray-800">{enrollment.progress || 0}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(enrollment.progress || 0)} rounded-full transition-all duration-500`}
              style={{ width: `${enrollment.progress || 0}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}
          </span>
          <Link
            to={`/course/${enrollment.course?._id}/learn`}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-colors"
          >
            {enrollment.completed ? 'Review Course' : 'Continue Learning'}
          </Link>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  const totalCourses = paidEnrollments.length + freeEnrollments.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Learning</h1>
            <p className="text-gray-600">
              {totalCourses} {totalCourses === 1 ? 'course' : 'courses'} in your library
            </p>
          </div>
          <Link
            to="/courses"
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-colors whitespace-nowrap"
          >
            Browse More Courses
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Total Courses</p>
            <p className="text-2xl font-bold text-gray-800">{totalCourses}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Paid Courses</p>
            <p className="text-2xl font-bold text-green-600">{paidEnrollments.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Free Courses</p>
            <p className="text-2xl font-bold text-blue-600">{freeEnrollments.length}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({totalCourses})
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'paid'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            💰 Paid ({paidEnrollments.length})
          </button>
          <button
            onClick={() => setActiveTab('free')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'free'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🎁 Free ({freeEnrollments.length})
          </button>
        </div>

        {/* No Courses Message */}
        {totalCourses === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Courses Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't enrolled in any courses yet. Start your learning journey today!
            </p>
            <Link
              to="/courses"
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors inline-block"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <>
            {/* Paid Courses Section */}
            {(activeTab === 'all' || activeTab === 'paid') && paidEnrollments.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-gray-800">💰 Paid Courses</h2>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {paidEnrollments.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paidEnrollments.map(renderCourseCard)}
                </div>
              </div>
            )}

            {/* Free Courses Section */}
            {(activeTab === 'all' || activeTab === 'free') && freeEnrollments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-gray-800">🎁 Free Courses</h2>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {freeEnrollments.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {freeEnrollments.map(renderCourseCard)}
                </div>
              </div>
            )}

            {/* Show message when a tab has no courses */}
            {activeTab === 'paid' && paidEnrollments.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                <div className="text-4xl mb-3">💰</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Paid Courses</h3>
                <p className="text-gray-600">You haven't purchased any courses yet.</p>
                <Link
                  to="/courses"
                  className="mt-3 inline-block text-green-600 hover:text-green-700 font-medium"
                >
                  Browse Courses →
                </Link>
              </div>
            )}

            {activeTab === 'free' && freeEnrollments.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                <div className="text-4xl mb-3">🎁</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Free Courses</h3>
                <p className="text-gray-600">You haven't enrolled in any free courses yet.</p>
                <Link
                  to="/courses"
                  className="mt-3 inline-block text-green-600 hover:text-green-700 font-medium"
                >
                  Browse Free Courses →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyLearning;