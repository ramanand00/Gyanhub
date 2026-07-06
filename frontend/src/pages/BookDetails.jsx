// pages/BookDetails.jsx
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
  FiBarChart2
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
  FaFilePdf
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const BookDetails = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [activeTab, setActiveTab] = useState('chapters');
  const headerRef = useRef(null);
  
  // Mock data for Questions Bank
  const [questions] = useState([
    { id: 1, chapter: 1, question: 'What is the fundamental concept of this chapter?', type: 'Theory', difficulty: 'Easy' },
    { id: 2, chapter: 1, question: 'Explain the key principles discussed in detail.', type: 'Theory', difficulty: 'Medium' },
    { id: 3, chapter: 2, question: 'Solve the numerical problem given in section 2.3.', type: 'Numerical', difficulty: 'Hard' },
    { id: 4, chapter: 2, question: 'Compare and contrast the different methods.', type: 'Theory', difficulty: 'Medium' },
    { id: 5, chapter: 3, question: 'What are the applications of this concept in real life?', type: 'Application', difficulty: 'Easy' },
  ]);
  
  // Mock data for Past Questions
  const [pastQuestions] = useState([
    { id: 1, year: '2024', semester: 'Spring', title: 'Final Examination', questions: 10, solved: true },
    { id: 2, year: '2023', semester: 'Fall', title: 'Mid-Term Examination', questions: 8, solved: false },
    { id: 3, year: '2023', semester: 'Spring', title: 'Final Examination', questions: 12, solved: true },
    { id: 4, year: '2022', semester: 'Fall', title: 'Final Examination', questions: 10, solved: false },
  ]);
  
  // Mock data for Practical Sheets
  const [practicalSheets] = useState([
    { id: 1, title: 'Lab Sheet 1: Introduction', description: 'Basic practical exercises', completed: true },
    { id: 2, title: 'Lab Sheet 2: Advanced Concepts', description: 'Intermediate practical exercises', completed: false },
    { id: 3, title: 'Lab Sheet 3: Implementation', description: 'Advanced practical implementation', completed: false },
    { id: 4, title: 'Lab Sheet 4: Project Work', description: 'Final project practical', completed: false },
  ]);

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
        console.log(`✅ Book loaded: ${bookData.title}`);
        console.log(`📚 Chapters found: ${bookData.chapters?.length || 0}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      {/* Sticky Header */}
      <div 
        ref={headerRef}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md transition-all duration-300 border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(`/semester/${book.semesterId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600" />
              </motion.button>
              <div className="flex items-center gap-3">
                {book.bookCover ? (
                  <img 
                    src={book.bookCover} 
                    alt={book.title} 
                    className="w-10 h-14 object-cover rounded shadow"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-2xl">📖</span>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-800 line-clamp-1">
                      {book.title}
                    </h1>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {book.programTitle} • Semester {book.semesterNumber}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-lg transition-colors ${isBookmarked ? 'bg-yellow-50 text-yellow-500' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <FiBookmark className={`w-5 h-5 ${isBookmarked ? 'fill-yellow-500' : ''}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-lg transition-colors ${isLiked ? 'bg-red-50 text-red-500' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              >
                <FiShare2 className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="h-96 w-full relative">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-orange-600">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-orange-500/20 animate-pulse"></div>
              <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-20 left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float-delayed"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <FaBook className="text-9xl text-white/20" />
              </div>
            </div>
          )}
          
          {/* Floating badges */}
          <div className="absolute top-6 left-6 right-6 z-10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 border border-white/20">
                  <FiBook className="w-4 h-4" />
                  {book.programTitle}
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 border border-white/20">
                  <FiLayers className="w-4 h-4" />
                  Semester {book.semesterNumber}
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 border border-white/20">
                  <FiFileText className="w-4 h-4" />
                  {chapters.length} Chapters
                </span>
              </div>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                ⭐ Must Read
              </span>
            </div>
          </div>
          
          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-medium border border-white/20 flex items-center gap-1">
                      <FiBook className="w-3 h-3" />
                      {book.category || 'Academic'}
                    </span>
                    <span className="bg-green-500/30 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-medium border border-green-400/30 flex items-center gap-1">
                      <FiCheckCircle className="w-3 h-3" />
                      {chapters.filter(c => c.isCompleted).length}/{chapters.length} Read
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 leading-tight">
                    {book.title}
                  </h1>
                  
                  {/* Authors */}
                  {book.authors && book.authors.length > 0 && book.authors.some(a => a) && (
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-white/70 text-sm flex items-center gap-1">
                        <FaUserTie className="w-4 h-4" />
                        By:
                      </span>
                      {book.authors.filter(a => a).map((author, i) => (
                        <span key={i} className="text-white font-medium text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          {author}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-white/80 text-base md:text-lg max-w-3xl line-clamp-2">
                    {book.description}
                  </p>
                  
                  {/* Quick stats */}
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <FiFileText className="w-4 h-4" />
                      <span>{chapters.length} Chapters</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <FiStar className="w-4 h-4" />
                      <span>{book.rating || '4.5'} ⭐</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <FiUsers className="w-4 h-4" />
                      <span>{book.readers || '1.2k+'} Readers</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-1 mb-8 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {[
              { id: 'chapters', icon: <FiFileText className="mr-2" />, label: 'Chapters' },
              { id: 'overview', icon: <FiInfo className="mr-2" />, label: 'Overview' },
              { id: 'questions', icon: <FaQuestionCircle className="mr-2" />, label: 'Questions Bank' },
              { id: 'past', icon: <FiFile className="mr-2" />, label: 'Past Questions' },
              { id: 'practical', icon: <FiClipboard className="mr-2" />, label: 'Practical Sheets' },
              { id: 'resources', icon: <FiFolder className="mr-2" />, label: 'Resources' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Chapters Tab */}
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
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
                        </div>
                        
                        {/* Decorative Elements */}
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="absolute -bottom-12 -left-12 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                        
                        {/* Content */}
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
                                {chapter.isCompleted && (
                                  <span className="bg-green-500/30 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <FiCheckCircle className="w-3 h-3" />
                                    Completed
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FiInfo className="text-green-500" />
                    About This Book
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {book.description || 'No description available for this book.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FiTarget className="text-orange-500" />
                    What You'll Learn
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {chapters.slice(0, 6).map((chapter, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg border border-green-100">
                        <FiCheckCircle className="text-green-500 text-sm flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-medium">{chapter.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FiTag className="text-purple-500" />
                    Topics Covered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {chapters.slice(0, 8).map((chapter, idx) => (
                      chapter.topics && chapter.topics.map((topic, i) => (
                        <span key={`${idx}-${i}`} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm border border-purple-100">
                          #{topic}
                        </span>
                      ))
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-500 to-orange-500 rounded-2xl p-6 text-white">
                  <h4 className="text-sm font-medium text-white/80 mb-4">Book Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Total Chapters</span>
                      <span className="text-2xl font-bold">{chapters.length}</span>
                    </div>
                  
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Readers</span>
                      <span className="text-2xl font-bold">{book.readers || '1.2k+'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Rating</span>
                      <span className="text-2xl font-bold">{book.rating || '4.8'} ⭐</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h4>
                  <div className="space-y-2">
                    <Link to={`/chapter/${chapters[0]?._id}`} className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm font-medium">
                      <FiBookOpen className="w-4 h-4" />
                      Start Reading
                    </Link>
                    <button className="w-full px-4 py-2.5 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                      <FiDownload className="w-4 h-4" />
                      Download PDF
                    </button>
                    <button className="w-full px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                      <FiShare2 className="w-4 h-4" />
                      Share Book
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Questions Bank Tab */}
        {activeTab === 'questions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FaQuestionCircle className="text-blue-500" />
                  Questions Bank
                </h3>
                <p className="text-sm text-gray-500">Practice questions for each chapter</p>
              </div>
              <div className="flex items-center gap-2">
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none">
                  <option value="all">All Chapters</option>
                  {chapters.map((ch, idx) => (
                    <option key={idx} value={ch.chapterNumber}>Chapter {ch.chapterNumber}</option>
                  ))}
                </select>
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none">
                  <option value="all">All Types</option>
                  <option value="theory">Theory</option>
                  <option value="numerical">Numerical</option>
                  <option value="application">Application</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all hover:border-green-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          Chapter {q.chapter}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {q.difficulty}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          {q.type}
                        </span>
                      </div>
                      <p className="text-gray-800 font-medium">{q.question}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="ml-4 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-1"
                    >
                      <FiPlay className="w-4 h-4" />
                      Solve
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Load More Questions
              </button>
            </div>
          </motion.div>
        )}

        {/* Past Questions Tab */}
        {activeTab === 'past' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FiFile className="text-orange-500" />
                  Past Questions
                </h3>
                <p className="text-sm text-gray-500">Previous year examination papers</p>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2">
                <FiDownload className="w-4 h-4" />
                Download All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastQuestions.map((pq, idx) => (
                <motion.div
                  key={pq.id}
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
                          {pq.semester}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-800">{pq.title}</h4>
                      <p className="text-sm text-gray-500">{pq.questions} Questions</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        pq.solved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {pq.solved ? '✅ Solved' : '📝 Pending'}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-1"
                      >
                        <FiEye className="w-4 h-4" />
                        View
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Practical Sheets Tab */}
        {activeTab === 'practical' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FiClipboard className="text-purple-500" />
                  Practical Sheets
                </h3>
                <p className="text-sm text-gray-500">Hands-on practical exercises</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                  {practicalSheets.filter(p => p.completed).length}/{practicalSheets.length} Completed
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {practicalSheets.map((ps, idx) => (
                <motion.div
                  key={ps.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 border rounded-xl hover:shadow-md transition-all ${
                    ps.completed ? 'border-green-300 bg-green-50/50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        ps.completed ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {ps.completed ? <FiCheckCircle className="w-5 h-5" /> : <FiFileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{ps.title}</h4>
                        <p className="text-sm text-gray-500">{ps.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ps.completed ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {ps.completed ? '✅ Completed' : '⏳ Pending'}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-1"
                      >
                        <FiPlay className="w-4 h-4" />
                        Start
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto">
                <FiFilePlus className="w-5 h-5" />
                View All Practical Sheets
              </button>
            </div>
          </motion.div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiFolder className="text-orange-500" />
              Additional Resources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: <FiFileText />, title: 'Sample Questions', desc: 'Practice questions for each chapter', color: 'from-blue-500 to-blue-600' },
                { icon: <FiPlay className="w-5 h-5" />, title: 'Video Lectures', desc: 'Recorded video lessons', color: 'from-red-500 to-red-600' },
                { icon: <FiBook />, title: 'Reference Materials', desc: 'Additional reading materials', color: 'from-green-500 to-green-600' },
                { icon: <FiLayers />, title: 'Practice Exercises', desc: 'Hands-on practice exercises', color: 'from-purple-500 to-purple-600' }
              ].map((resource, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-5 border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:border-green-300 cursor-pointer group bg-gradient-to-br from-white to-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 bg-gradient-to-br ${resource.color} rounded-xl text-white group-hover:scale-110 transition-transform`}>
                      {resource.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                        {resource.title}
                      </h4>
                      <p className="text-sm text-gray-500">{resource.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

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
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default BookDetails;