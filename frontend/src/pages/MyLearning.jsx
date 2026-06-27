// pages/MyLearning.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import { 
  FiArrowLeft, 
  FiBook, 
  FiClock, 
  FiTrendingUp, 
  FiAward,
  FiStar,
  FiChevronRight,
  FiCheckCircle,
  FiAlertCircle,
  FiBookOpen,
  FiUsers,
  FiPlayCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { 
  FaSpinner,
  FaUserGraduate,
  FaChalkboardTeacher
} from 'react-icons/fa';
import { 
  MdOutlinePayment,
  MdOutlineSchool,
  MdOutlineTrendingUp 
} from 'react-icons/md';

const MyLearning = () => {
  const { user } = useAuth();
  const [paidEnrollments, setPaidEnrollments] = useState([]);
  const [freeEnrollments, setFreeEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0
  });

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
      
      // Calculate stats
      const total = allEnrollments.length;
      const completed = allEnrollments.filter(e => e.progress === 100).length;
      const inProgress = allEnrollments.filter(e => e.progress > 0 && e.progress < 100).length;
      
      setStats({ total, completed, inProgress });
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      setError('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const getProgressTextColor = (progress) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-orange-600';
    return 'text-blue-600';
  };

  const getPaymentBadge = (enrollment) => {
    if (enrollment.paymentStatus === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-full text-xs font-medium">
          <MdOutlinePayment className="w-3 h-3" />
          Paid
        </span>
      );
    } else if (enrollment.paymentStatus === 'free') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-xs font-medium">
          <FiStar className="w-3 h-3" />
          Free
        </span>
      );
    }
    return null;
  };

  const renderCourseCard = (enrollment) => (
    <div key={enrollment._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border-l-4 border-green-500 hover:border-green-600 group">
      <Link to={`/course/${enrollment.course?._id}/learn`}>
        <div className="relative overflow-hidden">
          <img
            src={enrollment.course?.thumbnail || 'https://via.placeholder.com/400x225/059669/ffffff?text=Course'}
            alt={enrollment.course?.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {enrollment.completed && (
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" />
                Completed
              </span>
            )}
            <div className="flex items-center gap-1">
              {getPaymentBadge(enrollment)}
            </div>
          </div>
          
          {/* Progress info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between text-white text-sm">
              <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                <FiBook className="w-3 h-3" />
                {enrollment.course?.totalLessons || 0} lessons
              </span>
              <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                <FiTrendingUp className="w-3 h-3" />
                {enrollment.progress || 0}% complete
              </span>
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
        
        <div className="flex items-center text-sm text-gray-500 mb-3 gap-3">
          <span className="flex items-center gap-1">
            <FaChalkboardTeacher className="text-green-600" />
            {enrollment.course?.instructor?.name || 'Instructor'}
          </span>
          <span className="flex items-center gap-1">
            <FiClock className="text-green-600" />
            {new Date(enrollment.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-600 font-medium">Progress</span>
            <span className={`font-bold ${getProgressTextColor(enrollment.progress || 0)}`}>
              {enrollment.progress || 0}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(enrollment.progress || 0)} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${enrollment.progress || 0}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Link
            to={`/course/${enrollment.course?._id}/learn`}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-center flex items-center justify-center gap-2"
          >
            {enrollment.completed ? (
              <>
                <FiRefreshCw className="w-4 h-4" />
                Review Course
              </>
            ) : (
              <>
                <FiPlayCircle className="w-4 h-4" />
                Continue Learning
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
            <FaUserGraduate className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-500 text-2xl" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your courses...</p>
        </div>
      </div>
    );
  }

  const totalCourses = paidEnrollments.length + freeEnrollments.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        

        {/* Header with User Avatar - Matching Contact page */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              {user?.name ? (
                <span className="text-white text-2xl font-bold">
                  {user.name.charAt(0)}
                </span>
              ) : (
                <FaUserGraduate className="text-white text-2xl" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                My Learning
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                  {totalCourses} {totalCourses === 1 ? 'course' : 'courses'}
                </span>
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <span>👋</span> Welcome back, <span className="text-green-600 font-medium">{user?.name || 'Learner'}</span>!
                {stats.inProgress > 0 && ` You have ${stats.inProgress} course${stats.inProgress > 1 ? 's' : ''} in progress.`}
              </p>
            </div>
          </div>
          <Link
            to="/courses"
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap flex items-center gap-2"
          >
            <FiBookOpen className="w-4 h-4" />
            Browse More Courses
          </Link>
        </div>

        {/* Stats Cards - Matching Contact page info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Courses</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiBook className="text-2xl text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-orange-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MdOutlineTrendingUp className="text-2xl text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiAward className="text-2xl text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-blue-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Paid Courses</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{paidEnrollments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MdOutlinePayment className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message - Matching Contact page style */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center space-x-2">
              <FiAlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Tabs - Matching Contact page style */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-xl p-1.5 shadow-md border border-gray-100">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Courses ({totalCourses})
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'paid'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            💰 Paid ({paidEnrollments.length})
          </button>
          <button
            onClick={() => setActiveTab('free')}
            className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'free'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🎁 Free ({freeEnrollments.length})
          </button>
        </div>

        {/* No Courses Message - Styled like Contact page empty states */}
        {totalCourses === 0 ? (
          <div className="bg-white rounded-xl shadow-xl p-12 text-center border-l-4 border-orange-500">
            <div className="text-7xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Courses Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't enrolled in any courses yet. Start your learning journey today!
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FiBookOpen className="w-5 h-5" />
              Browse Courses
              <FiChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Paid Courses Section */}
            {(activeTab === 'all' || activeTab === 'paid') && paidEnrollments.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-800">💰 Paid Courses</h2>
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-800">🎁 Free Courses</h2>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {freeEnrollments.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {freeEnrollments.map(renderCourseCard)}
                </div>
              </div>
            )}

            {/* Empty state for tabs - Matching Contact page style */}
            {activeTab === 'paid' && paidEnrollments.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-10 text-center border border-gray-100">
                <div className="text-5xl mb-3">💰</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Paid Courses</h3>
                <p className="text-gray-600 mb-4">You haven't purchased any courses yet.</p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium hover:underline transition-colors"
                >
                  Browse Courses
                  <FiChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {activeTab === 'free' && freeEnrollments.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-10 text-center border border-gray-100">
                <div className="text-5xl mb-3">🎁</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Free Courses</h3>
                <p className="text-gray-600 mb-4">You haven't enrolled in any free courses yet.</p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium hover:underline transition-colors"
                >
                  Browse Free Courses
                  <FiChevronRight className="w-4 h-4" />
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