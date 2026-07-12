// pages/BookDetails.jsx - Clean & Optimized
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { 
  FiArrowLeft, 
  FiBook, 
  FiClock, 
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
  FiTag,
  FiFolder,
  FiFileText,
  FiPlay,
  FiHeart,
  FiShare2,
  FiDownload,
  FiEye,
  FiTarget,
  FiZap,
  FiGift,
  FiList,
  FiFilter,
  FiBookmark,
  FiFile,
  FiMessageSquare,
  FiExternalLink,
  FiClipboard,
  FiFilePlus,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiAward as FiAwardIcon,
  FiUser,
  FiCheck,
  FiX,
  FiMenu,
  FiHome,
  FiSettings,
  FiHelpCircle,
  FiMail,
  FiBell,
  FiMaximize2,
  FiMinimize2,
  FiZoomIn,
  FiZoomOut
} from 'react-icons/fi';
import { 
  FaSpinner, 
  FaGraduationCap, 
  FaUniversity,
  FaBook,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaMicrophone,
  FaVideo,
  FaRegClock,
  FaBookReader,
  FaUserTie,
  FaRegStar,
  FaRegBookmark,
  FaQuestionCircle,
  FaFileAlt,
  FaFilePdf,
  FaTrophy,
  FaChalkboard,
  FaCode,
  FaDesktop,
  FaNetworkWired,
  FaDatabase,
  FaShieldAlt,
  FaCloud,
  FaLaptopCode,
  FaGlobe
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// PDF VIEWER COMPONENT
// ============================================
const PDFViewerModal = ({ url, title, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);

  const getFileName = (url) => {
    if (!url) return 'PDF Document';
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('?')[0] || 'PDF Document';
  };

  const downloadPDF = async (url) => {
    try {
      window.open(url, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* PDF Toolbar */}
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FaFilePdf className="text-red-500 text-xl flex-shrink-0" />
            <span className="font-medium text-gray-700 truncate max-w-[300px]">
              {title || getFileName(url)}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
              title="Zoom Out"
            >
              <FiZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
              title="Zoom In"
            >
              <FiZoomIn className="w-4 h-4" />
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-blue-100 text-blue-600 rounded transition-colors"
              title="Open in new tab"
            >
              <FiExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => downloadPDF(url)}
              className="p-1.5 hover:bg-green-100 text-green-600 rounded transition-colors"
              title="Download PDF"
            >
              <FiDownload className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-red-100 text-red-500 rounded transition-colors"
              title="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="relative flex-1 bg-gray-100" style={{ minHeight: '500px' }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                <p className="mt-3 text-gray-600 text-sm">Loading PDF...</p>
              </div>
            </div>
          )}
          <iframe
            src={`${url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH&zoom=${zoom}`}
            width="100%"
            height="100%"
            className="w-full h-full"
            style={{ border: 'none', minHeight: '500px' }}
            title={`PDF Viewer - ${title || 'Document'}`}
            onLoad={() => setLoading(false)}
            allowFullScreen
          />
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span className="truncate">{title || getFileName(url)}</span>
          <div className="flex items-center gap-3">
            <span>Zoom: {Math.round(zoom * 100)}%</span>
            <span>•</span>
            <span>Click to zoom in/out</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// MAIN BOOK DETAILS COMPONENT
// ============================================
const BookDetails = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPdf, setSelectedPdf] = useState(null);
  const headerRef = useRef(null);

  const [stats, setStats] = useState({
    totalQuestions: 0,
    solvedQuestions: 0,
    totalPastQuestions: 0,
    totalPracticalSheets: 0,
    completedPracticalSheets: 0,
  });

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

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

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`🔍 Fetching book details for ID: ${bookId}`);
      
      const response = await API.get(`/api/books/${bookId}`);
      
      console.log('📚 Book Details Response:', response.data);
      
      if (response.data.success) {
        const bookData = response.data.book;
        setBook(bookData);
        setChapters(bookData.chapters || []);
        setOverview(bookData.overview || null);
        
        if (bookData.overview) {
          const overviewData = bookData.overview;
          setStats({
            totalQuestions: overviewData.questionsBank?.length || 0,
            solvedQuestions: overviewData.questionsBank?.filter(q => q.isSolved).length || 0,
            totalPastQuestions: overviewData.pastQuestions?.length || 0,
            totalPracticalSheets: overviewData.practicalSheets?.length || 0,
            completedPracticalSheets: overviewData.practicalSheets?.filter(s => s.completed).length || 0,
          });
        }
        
        console.log(`✅ Book loaded: ${bookData.title}`);
        console.log(`📚 Chapters found: ${bookData.chapters?.length || 0}`);
        console.log(`📋 Overview found: ${bookData.overview ? 'Yes' : 'No'}`);
      } else {
        setError('Failed to load book details');
      }
    } catch (error) {
      console.error('❌ Failed to fetch book:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const getChapterGradient = (index) => {
    const gradients = [
      'from-blue-500 to-blue-700',
      'from-purple-500 to-purple-700',
      'from-pink-500 to-pink-700',
      'from-green-500 to-green-700',
      'from-orange-500 to-orange-700',
      'from-red-500 to-red-700',
      'from-indigo-500 to-indigo-700',
      'from-teal-500 to-teal-700',
      'from-cyan-500 to-cyan-700',
      'from-amber-500 to-amber-700',
    ];
    return gradients[index % gradients.length];
  };

  const getChapterIcon = (index) => {
    const icons = [
      <FiFileText className="text-2xl" />,
      <FiBook className="text-2xl" />,
      <FiLayers className="text-2xl" />,
      <FiGrid className="text-2xl" />,
      <FiStar className="text-2xl" />,
      <FiTarget className="text-2xl" />,
      <FiZap className="text-2xl" />,
      <FiAward className="text-2xl" />,
    ];
    return icons[index % icons.length];
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Check out "${book.title}" on GyanPark!`,
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      case 'Very Hard': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getQuestionTypeColor = (type) => {
    switch (type) {
      case 'Theory': return 'bg-blue-100 text-blue-700';
      case 'Numerical': return 'bg-orange-100 text-orange-700';
      case 'Application': return 'bg-green-100 text-green-700';
      case 'Multiple Choice': return 'bg-purple-100 text-purple-700';
      case 'Short Answer': return 'bg-pink-100 text-pink-700';
      case 'Long Answer': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const parseCourseContents = (contents) => {
    if (!contents || contents.length === 0) return [];
    
    if (typeof contents[0] === 'object' && contents[0].chapterName) {
      return contents;
    }
    
    const parsed = [];
    contents.forEach((item, index) => {
      const match = item.match(/^Unit\s*(\d+)\.\s*(.+?)(?:\s*(\d+)\s*Hrs?\.?)?$/i);
      if (match) {
        parsed.push({
          chapterNumber: parseInt(match[1]),
          chapterName: match[2].trim(),
          creditHours: match[3] ? parseInt(match[3]) : 0,
        });
      } else {
        parsed.push({
          chapterNumber: index + 1,
          chapterName: item,
          creditHours: 0,
        });
      }
    });
    return parsed;
  };

  const openPdfViewer = (url, title) => {
    if (!url) {
      alert('PDF URL is not available');
      return;
    }
    setSelectedPdf({ url, title: title || 'PDF Document' });
  };

  const closePdfViewer = () => {
    setSelectedPdf(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
            <FaBookReader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl text-green-500" />
          </div>
          <p className="mt-4 text-gray-600 text-lg font-medium animate-pulse">Loading book details...</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md bg-white rounded-3xl shadow-2xl p-8 border-l-4 border-red-500"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            <FiAlertCircle className="text-6xl text-red-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Book Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Book not found'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchBookDetails}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <FiRefreshCw className="w-5 h-5" />
              Try Again
            </motion.button>
            <Link 
              to="/home" 
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const parsedContents = overview ? parseCourseContents(overview.courseContents) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      {/* Hero Section - Optimized */}
      <div className="relative overflow-hidden">
        <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-full relative">
          {book.bookCover ? (
            <div className="absolute inset-0">
              <img 
                src={book.bookCover} 
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <FaBook className="text-8xl sm:text-9xl text-white/10" />
                </div>
              </div>
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)`
              }}></div>
            </div>
          )}
          
          
          
          {/* Hero Content - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 z-10">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-3 sm:space-y-4"
              >
               
                
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {book.title}
                </h1>
                
                {/* Authors */}
                {book.authors && book.authors.length > 0 && book.authors.some(a => a) && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-white/70 text-xs sm:text-sm flex items-center gap-1">
                      <FaUserTie className="w-3 h-3 sm:w-4 sm:h-4" />
                      By:
                    </span>
                    {book.authors.filter(a => a).map((author, i) => (
                      <span key={i} className="text-white font-medium text-xs sm:text-sm bg-white/20 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                        {author}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Description */}
                <p className="text-white/80 text-sm sm:text-base max-w-3xl line-clamp-2 sm:line-clamp-3">
                  {book.description || 'Explore this comprehensive book designed to help you master the subject with ease.'}
                </p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-white/70 text-[10px] sm:text-xs">
                    <FiFileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-medium text-white/90">{chapters.length}</span>
                    <span className="hidden xs:inline">Chapters</span>
                  </div>
                  <div className="w-px h-4 bg-white/20"></div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-white/70 text-[10px] sm:text-xs">
                    <FaQuestionCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-medium text-white/90">{stats.totalQuestions}</span>
                    <span className="hidden xs:inline">Questions</span>
                  </div>
                  <div className="w-px h-4 bg-white/20"></div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-white/70 text-[10px] sm:text-xs">
                    <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    <span className="font-medium text-white/90">{stats.solvedQuestions}</span>
                    <span className="hidden xs:inline">Solved</span>
                  </div>
                  {stats.totalPracticalSheets > 0 && (
                    <>
                      <div className="w-px h-4 bg-white/20 hidden sm:block"></div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-white/70 text-[10px] sm:text-xs hidden sm:flex">
                        <FiClipboard className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                        <span className="font-medium text-white/90">{stats.totalPracticalSheets}</span>
                        <span>Labs</span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* CTA Buttons */}
                {/* <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-3">
                  {chapters.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('chapters')}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-gray-900 rounded-xl font-semibold text-sm sm:text-base hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    >
                      <FiPlay className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Start Reading</span>
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('overview')}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-md text-white rounded-xl font-semibold text-sm sm:text-base hover:bg-white/30 transition-all duration-200 border border-white/20 flex items-center gap-2"
                  >
                    <FiInfo className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xs:inline">View Details</span>
                    <span className="xs:hidden">Details</span>
                  </motion.button>
                </div> */}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs - Optimized for Mobile */}
        <div className="bg-white rounded-2xl shadow-lg p-1 mb-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {[
              { id: 'overview', icon: <FiInfo className="mr-1 sm:mr-2 text-xs sm:text-sm" />, label: 'Overview' },
              { id: 'chapters', icon: <FiFileText className="mr-1 sm:mr-2 text-xs sm:text-sm" />, label: 'Chapters' },
              { id: 'questions', icon: <FaQuestionCircle className="mr-1 sm:mr-2 text-xs sm:text-sm" />, label: 'Questions' },
              { id: 'past', icon: <FiFile className="mr-1 sm:mr-2 text-xs sm:text-sm" />, label: 'Past' },
              { id: 'practical', icon: <FiClipboard className="mr-1 sm:mr-2 text-xs sm:text-sm" />, label: 'Labs' },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-3 sm:px-6 
                  py-2 sm:py-3 
                  rounded-xl 
                  font-medium 
                  transition-all duration-200 
                  flex items-center
                  text-xs sm:text-sm
                  whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'questions' && stats.totalQuestions > 0 && (
                  <span className={`ml-1 sm:ml-2 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stats.totalQuestions}
                  </span>
                )}
                {tab.id === 'past' && stats.totalPastQuestions > 0 && (
                  <span className={`ml-1 sm:ml-2 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stats.totalPastQuestions}
                  </span>
                )}
                {tab.id === 'practical' && stats.totalPracticalSheets > 0 && (
                  <span className={`ml-1 sm:ml-2 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stats.totalPracticalSheets}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {overview ? (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* University Header */}
                <div className="bg-gradient-to-r from-green-600 to-orange-600 px-4 sm:px-6 py-4 flex items-center gap-3">
                  <FaUniversity className="text-white text-xl sm:text-2xl" />
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-white">{overview.university || 'Tribhuwan University'}</h2>
                    <p className="text-white/80 text-xs sm:text-sm">{overview.programType || 'Institute of Science and Technology'}</p>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {/* Course Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 font-medium">Course Title</p>
                      <p className="font-semibold text-gray-800 text-sm">{overview.courseTitle || book.title}</p>
                      <p className="text-sm text-gray-500">Semester: {overview.semester || 'I'}</p>
                      <p className="text-sm text-gray-500">Credit Hours: {overview.creditHours || 3}</p>
                      <p className="text-sm text-gray-500">Nature: {overview.natureOfCourse || 'Theory + Lab'}</p>
                      {overview.courseNumber && (
                        <p className="text-sm text-gray-500">Course No: {overview.courseNumber}</p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 font-medium">Full Marks</p>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <div className="text-center">
                          <p className="text-xl font-bold text-green-600">{overview.fullMarks?.theory || 60}</p>
                          <p className="text-[10px] text-gray-500">Theory</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-blue-600">{overview.fullMarks?.practical || 20}</p>
                          <p className="text-[10px] text-gray-500">Practical</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-orange-600">{overview.fullMarks?.internal || 20}</p>
                          <p className="text-[10px] text-gray-500">Internal</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 font-medium">Pass Marks</p>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <div className="text-center">
                          <p className="text-xl font-bold text-red-600">{overview.passMarks?.theory || 24}</p>
                          <p className="text-[10px] text-gray-500">Theory</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-purple-600">{overview.passMarks?.practical || 8}</p>
                          <p className="text-[10px] text-gray-500">Practical</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-pink-600">{overview.passMarks?.internal || 8}</p>
                          <p className="text-[10px] text-gray-500">Internal</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Description */}
                  {overview.courseDescription && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FiBook className="text-green-500" />
                        Course Description
                      </h3>
                      <p className="text-gray-700 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100 leading-relaxed">
                        {overview.courseDescription}
                      </p>
                    </div>
                  )}

                  {/* Course Objectives */}
                  {overview.courseObjectives && overview.courseObjectives.length > 0 && overview.courseObjectives.some(obj => obj) && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FiTarget className="text-orange-500" />
                        Course Objectives
                      </h3>
                      <div className="bg-gradient-to-r from-green-50 to-orange-50 p-4 rounded-lg border border-green-100">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {overview.courseObjectives.filter(obj => obj).join(' ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Course Contents Table */}
                  {parsedContents.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FiBookOpen className="text-green-500" />
                        Course Contents
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-green-50 to-orange-50 border-b-2 border-green-200">
                              <th className="px-3 py-2 text-left font-semibold text-gray-700 w-12">S.N.</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">Unit</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">Chapter</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700 w-16">Hrs.</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {parsedContents.map((content, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-2 text-gray-600 font-medium">{idx + 1}</td>
                                <td className="px-3 py-2 text-gray-600">Unit {content.chapterNumber}</td>
                                <td className="px-3 py-2 text-gray-700 font-medium">{content.chapterName}</td>
                                <td className="px-3 py-2 text-gray-600 text-center font-medium">{content.creditHours || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-50 border-t-2 border-gray-200">
                              <td colSpan="3" className="px-3 py-2 text-right font-medium text-gray-700">Total Credit Hours:</td>
                              <td className="px-3 py-2 text-center font-bold text-green-600">
                                {parsedContents.reduce((sum, c) => sum + (c.creditHours || 0), 0)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-gray-200">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Overview Available</h3>
                <p className="text-gray-600">The admin hasn't added an overview for this book yet.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ==================== CHAPTERS TAB ==================== */}
        {activeTab === 'chapters' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {chapters.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-lg p-16 text-center border-2 border-dashed border-gray-200"
              >
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Chapters Found</h3>
                <p className="text-gray-600">Chapters for this book will be added soon.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chapters.map((chapter, index) => {
                  const gradient = getChapterGradient(index);
                  const icon = getChapterIcon(index);
                  
                  return (
                    <motion.div
                      key={chapter._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                    >
                      <Link
                        to={`/chapter/${chapter._id}`}
                        className="block group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
                        </div>
                        
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="absolute -bottom-12 -left-12 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                        
                        <div className="relative p-6 z-10">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-2xl">
                                {icon}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-white/60 text-sm font-medium">
                                  Chapter {chapter.chapterNumber}
                                </span>
                              </div>
                              <h3 className="text-white font-bold text-lg group-hover:text-white/90 transition-colors line-clamp-1">
                                {chapter.title}
                              </h3>
                              {chapter.description && (
                                <p className="text-white/70 text-sm mt-1 line-clamp-2">
                                  {chapter.description}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-3 mt-3">
                                <span className="text-white/60 text-xs flex items-center gap-1">
                                  <FiFileText className="w-3 h-3" />
                                  {chapter.totalNotes || 0} Notes
                                </span>
                                {chapter.topics && chapter.topics.length > 0 && (
                                  <span className="text-white/60 text-xs flex items-center gap-1">
                                    <FiTag className="w-3 h-3" />
                                    {chapter.topics.length} Topics
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <motion.div 
                                className="text-white/40 group-hover:text-white/80 transition-colors"
                                whileHover={{ x: 5 }}
                              >
                                <FiArrowRight className="text-xl" />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ==================== QUESTIONS BANK TAB ==================== */}
        {activeTab === 'questions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
          >
            {!overview?.questionsBank || overview.questionsBank.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">❓</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Questions Available</h3>
                <p className="text-gray-600">Questions bank for this book will be added soon.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FaQuestionCircle className="text-blue-500" />
                      Questions Bank
                    </h3>
                    <p className="text-sm text-gray-500">
                      {stats.totalQuestions} questions • {stats.solvedQuestions} solved
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                      <FiCheck className="inline mr-1" />
                      {stats.solvedQuestions} Solved
                    </div>
                    <div className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium">
                      <FiX className="inline mr-1" />
                      {stats.totalQuestions - stats.solvedQuestions} Unsolved
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {overview.questionsBank.map((q, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all hover:border-green-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              Chapter {q.chapter || 'N/A'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(q.difficulty)}`}>
                              {q.difficulty || 'Medium'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getQuestionTypeColor(q.type)}`}>
                              {q.type || 'Theory'}
                            </span>
                            {q.marks > 0 && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                {q.marks} Marks
                              </span>
                            )}
                            {q.isSolved && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                <FiCheck className="w-3 h-3" />
                                Solved
                              </span>
                            )}
                          </div>
                          <p className="text-gray-800 font-medium">{q.question}</p>
                          {q.answer && (
                            <details className="mt-2">
                              <summary className="text-sm text-green-600 cursor-pointer hover:text-green-700 font-medium">
                                <FiEye className="inline mr-1" /> View Answer
                              </summary>
                              <p className="mt-2 p-3 bg-green-50 rounded-lg text-gray-700 text-sm">{q.answer}</p>
                            </details>
                          )}
                          {q.year && (
                            <p className="text-xs text-gray-400 mt-1">Year: {q.year}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ==================== PAST QUESTIONS TAB ==================== */}
        {activeTab === 'past' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
          >
            {!overview?.pastQuestions || overview.pastQuestions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Past Questions Available</h3>
                <p className="text-gray-600">Past questions for this book will be added soon.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FiFile className="text-orange-500" />
                      Past Questions
                    </h3>
                    <p className="text-sm text-gray-500">Previous year examination papers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {overview.pastQuestions.map((pq, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all hover:border-orange-300"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                              {pq.year}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              {pq.semester || 'Fall'}
                            </span>
                            {pq.solved && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                <FiCheck className="w-3 h-3" />
                                Solved
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-800">{pq.title}</h4>
                          <p className="text-sm text-gray-500">{pq.questions || 0} Questions</p>
                          {pq.description && (
                            <p className="text-sm text-gray-600 mt-1">{pq.description}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {pq.pdfUrl && (
                            <button
                              onClick={() => openPdfViewer(pq.pdfUrl, pq.title)}
                              className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-1"
                            >
                              <FaFilePdf className="w-4 h-4" />
                              View PDF
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ==================== PRACTICAL SHEETS TAB ==================== */}
        {activeTab === 'practical' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
          >
            {!overview?.practicalSheets || overview.practicalSheets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🧪</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Practical Sheets Available</h3>
                <p className="text-gray-600">Practical sheets for this book will be added soon.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FiClipboard className="text-purple-500" />
                      Practical Sheets
                    </h3>
                    <p className="text-sm text-gray-500">
                      {stats.completedPracticalSheets}/{stats.totalPracticalSheets} Completed
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                      Total: {stats.totalPracticalSheets}
                    </div>
                    <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      Completed: {stats.completedPracticalSheets}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {overview.practicalSheets.map((sheet, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 border rounded-xl hover:shadow-md transition-all ${
                        sheet.completed ? 'border-green-300 bg-green-50/50' : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            sheet.completed ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                          }`}>
                            {sheet.completed ? <FiCheckCircle className="w-5 h-5" /> : <FiFileText className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-gray-800">
                                Lab {sheet.labNumber || idx + 1}: {sheet.title}
                              </h4>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                sheet.completed ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {sheet.completed ? '✅ Completed' : '⏳ Pending'}
                              </span>
                            </div>
                            {sheet.description && (
                              <p className="text-sm text-gray-500">{sheet.description}</p>
                            )}
                          </div>
                        </div>
                        {sheet.pdfUrl && (
                          <button
                            onClick={() => openPdfViewer(sheet.pdfUrl, sheet.title)}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-1"
                          >
                            <FaFilePdf className="w-4 h-4" />
                            View PDF
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* ==================== PDF VIEWER MODAL ==================== */}
      <AnimatePresence>
        {selectedPdf && (
          <PDFViewerModal
            url={selectedPdf.url}
            title={selectedPdf.title}
            onClose={closePdfViewer}
          />
        )}
      </AnimatePresence>

      {/* Share Notification */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2"
          >
            <FiCheckCircle className="text-green-400" />
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
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
        @media (max-width: 480px) {
          .xs\:inline {
            display: inline !important;
          }
          .xs\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BookDetails;