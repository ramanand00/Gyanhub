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
  FiSearch,
  FiFilter
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
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLiked, setIsLiked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [filteredBooks, setFilteredBooks] = useState([]);
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

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, selectedCategory]);

  const fetchSemesterDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`🔍 Fetching semester details for ID: ${semesterId}`);
      
      const response = await API.get(`/api/semesters/${semesterId}`);
      
      console.log('📚 Semester Details Response:', response.data);
      
      if (response.data.success) {
        const semesterData = response.data.semester;
        setSemester(semesterData);
        setBooks(semesterData.books || []);
        setFilteredBooks(semesterData.books || []);
        console.log(`✅ Semester loaded: ${semesterData.title}`);
        console.log(`📚 Books found: ${semesterData.books?.length || 0}`);
      } else {
        setError('Failed to load semester details');
      }
    } catch (error) {
      console.error('❌ Failed to fetch semester:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load semester details');
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = [...books];
    
    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.description && book.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (book.authors && book.authors.some(author => 
          author && author.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(book => 
        book.category === selectedCategory
      );
    }
    
    setFilteredBooks(filtered);
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

  const getCategories = () => {
    const categories = new Set();
    books.forEach(book => {
      if (book.category) categories.add(book.category);
    });
    return ['all', ...Array.from(categories)];
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Semester Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Semester not found'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchSemesterDetails}
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
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600" />
              </motion.button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getSemesterEmoji(semester.semesterNumber)}</span>
                  <h1 className="text-lg font-bold text-gray-800 line-clamp-1">
                    {semester.title || `Semester ${semester.semesterNumber}`}
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{semester.programTitle}</span>
                  <span>•</span>
                  <span>{semester.duration || '6 Months'}</span>
                  <span>•</span>
                  <span>{books.length} Books</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
        <div className="h-80 w-full relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-orange-600">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-orange-500/20 animate-pulse"></div>
            
            {/* Decorative shapes */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float-delayed"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-9xl text-white/20">
                {getSemesterEmoji(semester.semesterNumber)}
              </div>
            </div>
          </div>
          
          {/* Floating badges */}
          <div className="absolute top-6 left-6 right-6 z-10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 border border-white/20">
                  {getSemesterIcon(semester.semesterNumber)}
                  Semester {semester.semesterNumber}
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 border border-white/20">
                  <FiClock className="w-4 h-4" />
                  {semester.duration || '6 Months'}
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 border border-white/20">
                  <FiBook className="w-4 h-4" />
                  {books.length} Books
                </span>
              </div>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                {getSemesterLabel(semester.semesterNumber)}
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
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                    {semester.title || `Semester ${semester.semesterNumber}`}
                  </h1>
                  <p className="text-white/80 text-base md:text-lg max-w-3xl">
                    {semester.description || `Explore the ${getSemesterLabel(semester.semesterNumber)} semester of ${semester.programTitle}`}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <FiBookOpen className="w-4 h-4" />
                      <span>{books.length} Books Available</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <FiTarget className="w-4 h-4" />
                      <span>{getSemesterLabel(semester.semesterNumber)} Level</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <FiZap className="w-4 h-4" />
                      <span>{semester.programTitle}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-white text-gray-800 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <FiPlay className="w-5 h-5" />
                    Start Learning
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/20 flex items-center gap-2"
                  >
                    <FiDownload className="w-5 h-5" />
                    Download All
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <FiBook className="text-xl" />, label: 'Total Books', value: books.length },
            { icon: <FiUsers className="text-xl" />, label: 'Students', value: semester.students || '120+' },
            { icon: <FiClock className="text-xl" />, label: 'Duration', value: semester.duration || '6 Months' },
            { icon: <FiStar className="text-xl" />, label: 'Rating', value: semester.rating || '4.8 ⭐' }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-100 to-orange-100 rounded-lg">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-white"
              >
                {getCategories().map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <FiGridIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <FiList className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-500 ml-2">
                {filteredBooks.length} books found
              </span>
            </div>
          </div>
        </div>

        {/* Books Grid/List */}
        {filteredBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-16 text-center border-2 border-dashed border-gray-200"
          >
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Books Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No books match your search criteria.' : 'Books for this semester will be added soon.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Clear Filters
              </button>
            )}
            {!searchTerm && (
              <button
                onClick={fetchSemesterDetails}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Refresh
              </button>
            )}
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
              >
                <Link
                  to={`/book/${book._id}`}
                  className="block group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getBookGradient(index)}`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="absolute -bottom-12 -left-12 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                  
                  {/* Book Cover */}
                  <div className="relative h-48">
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
                      <div className="w-full h-full flex items-center justify-center text-7xl text-white/30">
                        📖
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex items-center gap-3 text-white/80 text-xs">
                        <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                          📝 {book.totalChapters || 0} Chapters
                        </span>
                        {book.totalPages && (
                          <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                            📄 {book.totalPages} Pages
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Book Info */}
                  <div className="relative p-5 z-10 text-white">
                    <h3 className="font-bold text-lg group-hover:text-white/90 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    
                    {book.description && (
                      <p className="text-white/70 text-sm mt-2 line-clamp-2">
                        {book.description}
                      </p>
                    )}
                    
                    {book.authors && book.authors.length > 0 && book.authors.some(a => a) && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {book.authors.filter(a => a).slice(0, 2).map((author, i) => (
                          <span key={i} className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                            ✍️ {author}
                          </span>
                        ))}
                        {book.authors.filter(a => a).length > 2 && (
                          <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                            +{book.authors.filter(a => a).length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/20">
                      <div className="flex items-center gap-2">
                        {book.category && (
                          <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                            {book.category}
                          </span>
                        )}
                      </div>
                      <motion.div 
                        className="text-white/50 group-hover:text-white/80 transition-colors flex items-center gap-1"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-sm font-medium">View</span>
                        <FiArrowRight className="text-lg" />
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
          <div className="space-y-4">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/book/${book._id}`}
                  className="block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 group"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                      style={{ background: getBookColor(index) }}
                    >
                      📖
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                        {book.title}
                      </h3>
                      {book.authors && book.authors.length > 0 && book.authors.some(a => a) && (
                        <p className="text-sm text-gray-500">
                          by {book.authors.filter(a => a).join(', ')}
                        </p>
                      )}
                      {book.description && (
                        <p className="text-sm text-gray-600 line-clamp-1">{book.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">
                        {book.totalChapters || 0} Chapters
                      </div>
                      {book.category && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {book.category}
                        </span>
                      )}
                      <FiArrowRight className="text-gray-400 group-hover:text-green-500 transition-colors text-xl" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {books.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-gradient-to-r from-green-600 via-green-700 to-orange-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <FaBookReader className="text-3xl" />
                  Ready to Explore These Books?
                </h3>
                <p className="text-white/80 text-sm mt-1">
                  Choose a book above to start your learning journey
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                  <FiBookOpen className="text-lg" />
                  {filteredBooks.length} Books Available
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white text-green-700 rounded-xl font-bold hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <FiPlay className="w-5 h-5" />
                  Start Learning
                </motion.button>
              </div>
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

export default SemesterDetails;