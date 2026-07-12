// pages/SemesterDetails.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { 
  FiArrowLeft, 
  FiBook, 
  FiClock, 
  FiCalendar, 
  FiLayers, 
  FiStar,
  FiTrendingUp,
  FiAward,
  FiBookOpen,
  FiGrid,
  FiThumbsUp,
  FiUsers,
  FiInfo,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiHash,
  FiEdit3,
  FiTag,
  FiFolder,
  FiFileText,
  FiPlay,
  FiHeart,
  FiShare2,
  FiDownload,
  FiEye,
  FiBarChart2,
  FiTarget,
  FiZap,
  FiGift,
  FiMapPin,
  FiList,
  FiGrid as FiGridIcon,
  FiUser,
  FiCalendar as FiCalendarIcon
} from 'react-icons/fi';
import { 
  FaSpinner, 
  FaGraduationCap, 
  FaUniversity,
  FaCalendarAlt,
  FaBook,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaMicrophone,
  FaVideo,
  FaRegClock,
  FaBookReader,
  FaUserTie
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const SemesterDetails = () => {
  const { semesterId } = useParams();
  const navigate = useNavigate();
  const [semester, setSemester] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isLiked, setIsLiked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    fetchSemesterDetails();
  }, [semesterId]);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const scrollY = window.scrollY;
        if (scrollY > 100) {
          headerRef.current.classList.add('shadow-lg', 'bg-white/95');
        } else {
          headerRef.current.classList.remove('shadow-lg', 'bg-white/95');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchSemesterDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await API.get(`/api/semesters/${semesterId}`);
      
      if (response.data.success) {
        const semesterData = response.data.semester;
        setSemester(semesterData);
        setBooks(semesterData.books || []);
      } else {
        setError('Failed to load semester details');
      }
    } catch (error) {
      console.error('Failed to fetch semester:', error);
      setError(error.response?.data?.message || 'Failed to load semester details');
    } finally {
      setLoading(false);
    }
  };

  const getBookGradient = (index) => {
    const gradients = [
      'from-blue-400 via-blue-500 to-blue-700',
      'from-purple-400 via-purple-500 to-purple-700',
      'from-pink-400 via-pink-500 to-pink-700',
      'from-green-400 via-green-500 to-green-700',
      'from-orange-400 via-orange-500 to-orange-700',
      'from-red-400 via-red-500 to-red-700',
      'from-indigo-400 via-indigo-500 to-indigo-700',
      'from-teal-400 via-teal-500 to-teal-700',
      'from-cyan-400 via-cyan-500 to-cyan-700',
      'from-amber-400 via-amber-500 to-amber-700',
    ];
    return gradients[index % gradients.length];
  };

  const getBookColor = (index) => {
    const colors = [
      '#3B82F6', '#8B5CF6', '#EC4899', '#10B981',
      '#F59E0B', '#EF4444', '#6366F1', '#14B8A6',
      '#06B6D4', '#FBBF24'
    ];
    return colors[index % colors.length];
  };

  const getSemesterIcon = (semesterNumber) => {
    const icons = {
      1: <FaGraduationCap className="text-3xl" />,
      2: <FiBook className="text-3xl" />,
      3: <FiAward className="text-3xl" />,
      4: <FiTrendingUp className="text-3xl" />,
      5: <FiLayers className="text-3xl" />,
      6: <FiGrid className="text-3xl" />,
      7: <FiClock className="text-3xl" />,
      8: <FiStar className="text-3xl" />,
    };
    return icons[semesterNumber] || <FiBook className="text-3xl" />;
  };

  const getSemesterEmoji = (semesterNumber) => {
    const emojis = {
      1: '🌱',
      2: '📚',
      3: '⚡',
      4: '🎯',
      5: '🚀',
      6: '🏆',
      7: '💼',
      8: '🎓',
    };
    return emojis[semesterNumber] || '📖';
  };

  const getSemesterLabel = (semesterNumber) => {
    const labels = {
      1: 'Foundation',
      2: 'Core',
      3: 'Advanced',
      4: 'Specialized',
      5: 'Expert',
      6: 'Mastery',
      7: 'Professional',
      8: 'Capstone',
    };
    return labels[semesterNumber] || `Semester ${semesterNumber}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: semester.title,
          text: `Check out ${semester.title} on GyanPark!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
            <FaBookReader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl text-green-500" />
          </div>
          <p className="mt-4 text-gray-600 text-lg font-medium animate-pulse">Loading semester details...</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !semester) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50 px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border-l-4 border-red-500 w-full"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            <FiAlertCircle className="text-5xl sm:text-6xl text-red-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Semester Not Found</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{error || 'Semester not found'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchSemesterDetails}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FiRefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              Try Again
            </motion.button>
            <Link 
              to="/home" 
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="h-56 sm:h-80 w-full relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-orange-600">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-orange-500/20 animate-pulse"></div>
            <div className="absolute top-20 right-20 w-48 h-48 sm:w-64 sm:h-64 bg-white/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-20 w-60 h-60 sm:w-80 sm:h-80 bg-white/5 rounded-full blur-3xl animate-float-delayed"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-6xl sm:text-9xl text-white/20">
                {getSemesterEmoji(semester.semesterNumber)}
              </div>
            </div>
          </div>
          
          {/* Floating badges */}
          <div className="absolute top-3 sm:top-6 left-3 sm:left-6 right-3 sm:right-6 z-10">
            <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="bg-white/20 backdrop-blur-md text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 sm:gap-2 border border-white/20">
                  <span className="hidden xs:inline">{getSemesterIcon(semester.semesterNumber)}</span>
                  Semester {semester.semesterNumber}
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 sm:gap-2 border border-white/20">
                  <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{semester.duration || '6 Months'}</span>
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 sm:gap-2 border border-white/20">
                  <FiBook className="w-3 h-3 sm:w-4 sm:h-4" />
                  {books.length} Books
                </span>
              </div>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold shadow-lg">
                {getSemesterLabel(semester.semesterNumber)}
              </span>
            </div>
          </div>
          
          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-8 z-10">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col gap-2 sm:gap-6"
              >
                <div>
                  <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-white mb-1 sm:mb-3 line-clamp-2">
                    {semester.title || `Semester ${semester.semesterNumber}`}
                  </h1>
                  <p className="text-white/80 text-xs sm:text-base md:text-lg max-w-3xl line-clamp-2">
                    {semester.description || `Explore the ${getSemesterLabel(semester.semesterNumber)} semester of ${semester.programTitle}`}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-4">
                    <div className="flex items-center gap-1 sm:gap-2 text-white/70 text-[10px] sm:text-sm">
                      <FiBookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{books.length} Books Available</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 text-white/70 text-[10px] sm:text-sm">
                      <FiTarget className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{getSemesterLabel(semester.semesterNumber)} Level</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 text-white/70 text-[10px] sm:text-sm">
                      <FaUniversity className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate max-w-[100px] sm:max-w-full">{semester.programTitle}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiBook className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
              Books in this Semester
              <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1">
                ({books.length})
              </span>
            </h2>
          </div>
          <div className="bg-white rounded-xl shadow-md p-1 flex gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiGridIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiList className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">List</span>
            </button>
          </div>
        </div>

        {/* Books Grid/List */}
        {books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 sm:p-16 text-center border-2 border-dashed border-gray-200"
          >
            <div className="text-5xl sm:text-6xl mb-4">📖</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Books Found</h3>
            <p className="text-sm sm:text-base text-gray-600">Books for this semester will be added soon.</p>
            <button
              onClick={fetchSemesterDetails}
              className="mt-4 px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2 text-sm sm:text-base"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {books.map((book, index) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
              >
                <Link
                  to={`/book/${book._id}`}
                  className="block group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getBookGradient(index)}`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -top-12 -right-12 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="absolute -bottom-12 -left-12 w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                  
                  {/* Book Cover */}
                  <div className="relative h-36 sm:h-48">
                    {book.bookCover ? (
                      <img 
                        src={book.bookCover} 
                        alt={book.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl sm:text-7xl text-white/30">
                        📖
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-4">
                      <div className="flex items-center gap-1.5 sm:gap-3 text-white/80 text-[8px] sm:text-xs">
                        <span className="bg-white/20 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                          📝 {book.totalChapters || 0} Chapters
                        </span>
                        {book.totalPages && (
                          <span className="bg-white/20 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hidden xs:inline">
                            📄 {book.totalPages} Pages
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Book Info */}
                  <div className="relative p-3 sm:p-5 z-10 text-white">
                    <h3 className="font-bold text-sm sm:text-lg group-hover:text-white/90 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    
                    {book.description && (
                      <p className="text-white/70 text-[10px] sm:text-sm mt-1 sm:mt-2 line-clamp-2 hidden xs:block">
                        {book.description}
                      </p>
                    )}
                    
                    {book.authors && book.authors.length > 0 && book.authors.some(a => a) && (
                      <div className="flex flex-wrap gap-0.5 sm:gap-1 mt-1.5 sm:mt-3">
                        {book.authors.filter(a => a).slice(0, 2).map((author, i) => (
                          <span key={i} className="text-[8px] sm:text-xs bg-white/20 backdrop-blur-sm text-white px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-[60px] sm:max-w-full">
                            ✍️ {author}
                          </span>
                        ))}
                        {book.authors.filter(a => a).length > 2 && (
                          <span className="text-[8px] sm:text-xs bg-white/20 backdrop-blur-sm text-white px-1.5 sm:px-2 py-0.5 rounded-full">
                            +{book.authors.filter(a => a).length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-2 sm:mt-4 flex items-center justify-between pt-1.5 sm:pt-3 border-t border-white/20">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {book.category && (
                          <span className="text-[8px] sm:text-xs bg-white/20 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-[60px] sm:max-w-full">
                            {book.category}
                          </span>
                        )}
                      </div>
                      <motion.div 
                        className="text-white/50 group-hover:text-white/80 transition-colors flex items-center gap-0.5 sm:gap-1"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-[10px] sm:text-sm font-medium">View</span>
                        <FiArrowRight className="text-sm sm:text-lg" />
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-3 sm:space-y-4">
            {books.map((book, index) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/book/${book._id}`}
                  className="block bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-3 sm:p-4 group"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div 
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-xl sm:text-3xl flex-shrink-0"
                      style={{ background: getBookColor(index) }}
                    >
                      📖
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-green-600 transition-colors line-clamp-1">
                        {book.title}
                      </h3>
                      {book.authors && book.authors.length > 0 && book.authors.some(a => a) && (
                        <p className="text-[10px] sm:text-sm text-gray-500 line-clamp-1">
                          by {book.authors.filter(a => a).join(', ')}
                        </p>
                      )}
                      {book.description && (
                        <p className="text-[10px] sm:text-sm text-gray-600 line-clamp-1 hidden xs:block">{book.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <div className="text-[10px] sm:text-sm text-gray-500 hidden sm:block">
                        {book.totalChapters || 0} Chapters
                      </div>
                      {book.category && (
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-full text-[8px] sm:text-xs truncate max-w-[50px] sm:max-w-full">
                          {book.category}
                        </span>
                      )}
                      <FiArrowRight className="text-gray-400 group-hover:text-green-500 transition-colors text-sm sm:text-xl" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Share Notification */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm sm:text-base"
          >
            <FiCheckCircle className="text-green-400 w-4 h-4 sm:w-5 sm:h-5" />
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        /* Custom breakpoint for extra small screens */
        @media (min-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
          .xs\\:block {
            display: block;
          }
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .xs\\:hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default SemesterDetails;