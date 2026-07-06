// pages/ProgramDetails.jsx
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
  FiMapPin
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
  FaRegClock
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ProgramDetails = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSemester, setSelectedSemester] = useState(null);
  const headerRef = useRef(null);

  useEffect(() => {
    fetchProgramDetails();
  }, [programId]);

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

  const fetchProgramDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await API.get(`/api/programs/${programId}`);
      
      if (response.data.success) {
        const programData = response.data.program;
        setProgram(programData);
        setSemesters(programData.semesters || []);
        if (programData.semesters && programData.semesters.length > 0) {
          setSelectedSemester(programData.semesters[0]);
        }
      } else {
        setError('Failed to load program details');
      }
    } catch (error) {
      console.error('❌ Failed to fetch program:', error);
      setError(error.response?.data?.message || 'Failed to load program details');
    } finally {
      setLoading(false);
    }
  };

  const getSemesterGradient = (index) => {
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

  const getSemesterIcon = (semesterNumber) => {
    const icons = {
      1: <FaGraduationCap className="text-2xl" />,
      2: <FiBook className="text-2xl" />,
      3: <FiAward className="text-2xl" />,
      4: <FiTrendingUp className="text-2xl" />,
      5: <FiLayers className="text-2xl" />,
      6: <FiGrid className="text-2xl" />,
      7: <FiClock className="text-2xl" />,
      8: <FiStar className="text-2xl" />,
    };
    return icons[semesterNumber] || <FiBook className="text-2xl" />;
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

  const getSemesterColor = (index) => {
    const colors = [
      '#3B82F6', '#8B5CF6', '#EC4899', '#10B981',
      '#F59E0B', '#EF4444', '#6366F1', '#14B8A6',
      '#06B6D4', '#FBBF24'
    ];
    return colors[index % colors.length];
  };

  const getProgramStats = () => {
    if (!program) return { totalBooks: 0, totalStudents: 0, totalSemesters: 0 };
    const totalBooks = semesters.reduce((acc, s) => acc + (s.totalBooks || 0), 0);
    return {
      totalBooks,
      totalStudents: program.students || Math.floor(Math.random() * 500) + 100,
      totalSemesters: semesters.length,
    };
  };

  const stats = getProgramStats();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: program.title,
          text: `Check out ${program.title} on GyanPark!`,
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
            <FaGraduationCap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl text-green-500" />
          </div>
          <p className="mt-4 text-gray-600 text-lg font-medium animate-pulse">Loading program details...</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !program) {
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Program Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Program not found'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchProgramDetails}
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
                onClick={() => navigate('/home')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600" />
              </motion.button>
              <div>
                <h1 className="text-lg font-bold text-gray-800 line-clamp-1">{program.title}</h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{program.category}</span>
                  <span>•</span>
                  <span>{stats.totalSemesters} Semesters</span>
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

      {/* Program Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div className="h-[500px] w-full relative">
          {program.thumbnail && !imageError ? (
            <div className="absolute inset-0">
              <img 
                src={program.thumbnail} 
                alt={program.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
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
                <FaUniversity className="text-9xl text-white/20" />
              </div>
            </div>
          )}
          
          {/* Floating badges */}
          <div className="absolute top-6 left-6 right-6 z-10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 border border-white/20">
                  <FiBook className="w-4 h-4" />
                  {stats.totalSemesters} Semesters
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 border border-white/20">
                  <FiClock className="w-4 h-4" />
                  {program.duration || '4 Years'}
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 border border-white/20">
                  <FiUsers className="w-4 h-4" />
                  {stats.totalStudents}+ Students
                </span>
              </div>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                ⭐ Featured Program
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
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-medium border border-white/20">
                      {program.category}
                    </span>
                    {/* REMOVED: Completion rate badge */}
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 leading-tight">
                    {program.title}
                  </h1>
                  <p className="text-white/80 text-base md:text-lg max-w-2xl line-clamp-2">
                    {program.description}
                  </p>
                  
                  {/* Quick stats */}
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <FiBookOpen className="w-4 h-4" />
                      <span>{stats.totalBooks} Books</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <FiTarget className="w-4 h-4" />
                      <span>{stats.totalSemesters} Semesters</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <FiZap className="w-4 h-4" />
                      <span>Updated {new Date(program.updatedAt).toLocaleDateString()}</span>
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
            {['overview', 'semesters', 'curriculum', 'reviews'].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 capitalize ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'overview' && <FiInfo className="inline mr-2" />}
                {tab === 'semesters' && <FiLayers className="inline mr-2" />}
                {tab === 'curriculum' && <FiBookOpen className="inline mr-2" />}
                {tab === 'reviews' && <FiStar className="inline mr-2" />}
                {tab}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Program Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FiInfo className="text-green-500" />
                    About This Program
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {program.description || 'No description available for this program.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['Full-time', '4 Years', 'Degree Program', 'Accredited'].map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* What You'll Learn */}
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FiTarget className="text-orange-500" />
                    What You'll Learn
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Core Concepts & Fundamentals',
                      'Advanced Techniques & Methods',
                      'Practical Applications',
                      'Industry Best Practices',
                      'Problem Solving Skills',
                      'Critical Thinking'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <FiCheckCircle className="text-green-500 text-sm" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Stats Card - REMOVED COMPLETION RATE */}
                <div className="bg-gradient-to-br from-green-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
                  <h4 className="text-sm font-medium text-white/80 mb-4">Program Statistics</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Total Semesters</span>
                      <span className="text-2xl font-bold">{stats.totalSemesters}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Total Books</span>
                      <span className="text-2xl font-bold">{stats.totalBooks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Students</span>
                      <span className="text-2xl font-bold">{stats.totalStudents}+</span>
                    </div>
                    {/* REMOVED: Completion Rate and Progress Bar */}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors flex items-center gap-2 text-sm font-medium">
                      <FiBookOpen className="w-4 h-4" />
                      View All Books
                    </button>
                    <button className="w-full px-4 py-2.5 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors flex items-center gap-2 text-sm font-medium">
                      <FiUsers className="w-4 h-4" />
                      Join Study Group
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Semesters Tab */}
        {activeTab === 'semesters' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* REMOVED: Semester Progress Overview section */}

            {/* Semesters Grid */}
            {semesters.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-16 text-center border-2 border-dashed border-gray-200">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Semesters Available</h3>
                <p className="text-gray-600">Semesters for this program will be added soon.</p>
                <button
                  onClick={fetchProgramDetails}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {semesters.map((semester, index) => {
                  const gradient = getSemesterGradient(index);
                  const icon = getSemesterIcon(semester.semesterNumber);
                  const emoji = getSemesterEmoji(semester.semesterNumber);
                  const label = getSemesterLabel(semester.semesterNumber);
                  
                  return (
                    <motion.div
                      key={semester._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -8 }}
                    >
                      <Link
                        to={`/semester/${semester._id}`}
                        className="block group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                      >
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
                        </div>
                        
                        {/* Decorative Elements */}
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="absolute -bottom-12 -left-12 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                        
                        {/* Floating Emoji */}
                        <div className="absolute top-3 right-3 text-2xl opacity-20 group-hover:opacity-40 transition-opacity">
                          {emoji}
                        </div>
                        
                        {/* Content */}
                        <div className="relative p-6 z-10">
                          {/* Semester Number Badge */}
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white/80 text-2xl">
                                  {icon}
                                </span>
                                <span className="text-white font-bold text-xs bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                                  Sem {semester.semesterNumber}
                                </span>
                              </div>
                              <h3 className="text-white font-bold text-lg mt-1 group-hover:text-white/90 transition-colors">
                                {semester.title || `Semester ${semester.semesterNumber}`}
                              </h3>
                              <p className="text-white/60 text-xs font-medium">
                                {label}
                              </p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1 text-center">
                              <span className="text-white font-bold text-sm">
                                {semester.totalBooks || 0}
                              </span>
                              <span className="text-white/70 text-[10px] ml-0.5">📚</span>
                            </div>
                          </div>
                          
                          {/* Description */}
                          {semester.description && (
                            <p className="text-white/70 text-sm mt-3 line-clamp-2">
                              {semester.description}
                            </p>
                          )}
                          
                          {/* REMOVED: Progress Bar section */}
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
                            <div className="flex items-center gap-2 text-white/60 text-xs">
                              <span>⏱️ {semester.duration || '6 Months'}</span>
                              {semester.totalBooks > 0 && (
                                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                                  {semester.totalBooks} books
                                </span>
                              )}
                            </div>
                            <motion.div 
                              className="text-white/50 group-hover:text-white/80 transition-colors"
                              whileHover={{ x: 5 }}
                            >
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
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Curriculum Tab */}
        {activeTab === 'curriculum' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiBookOpen className="text-green-500" />
              Curriculum Overview
            </h3>
            <div className="space-y-4">
              {semesters.map((semester, idx) => (
                <motion.div
                  key={semester._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: getSemesterColor(idx) }}
                  >
                    S{idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      {semester.title || `Semester ${idx + 1}`}
                    </h4>
                    <p className="text-sm text-gray-500">{getSemesterLabel(idx + 1)}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {semester.totalBooks || 0} Books
                  </div>
                  <FiArrowRight className="text-gray-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-6">
                <FiStar className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Reviews Coming Soon
              </h3>
              <p className="text-gray-600 max-w-md leading-relaxed">
                We're working on a student review system. Soon you'll be able to
                read genuine feedback from learners and share your own experience
                after completing a course.
              </p>
              <span className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium">
                🚀 Feature Coming Soon...
              </span>
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

export default ProgramDetails;