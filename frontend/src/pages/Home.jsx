// pages/Home.jsx - Cleaned version
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import { 
  FiBook, 
  FiGrid, 
  FiClock, 
  FiCalendar, 
  FiArrowRight, 
  FiChevronDown,
  FiFilter,
  FiTrendingUp,
  FiAward,
  FiBookOpen,
  FiLayers,
  FiFolder,
  FiStar,
  FiUsers,
  FiRefreshCw,
  FiHome,
  FiInfo,
  FiThumbsUp,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit3,
  FiHash,
  FiTag,
  FiArrowLeft
} from 'react-icons/fi';
import { 
  FaSpinner, 
  FaGraduationCap, 
  FaBook, 
  FaUniversity,
  FaCalendarAlt,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaUserCircle
} from 'react-icons/fa';
import { MdOutlineCategory, MdOutlineDateRange } from 'react-icons/md';

const Home = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    sortPrograms();
  }, [programs, sortBy]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await API.get('/api/programs', {
        params: { limit: 50 }
      });
      
      if (response.data.success) {
        setPrograms(response.data.programs || []);
        setFilteredPrograms(response.data.programs || []);
      } else {
        setError('Failed to load programs');
      }
    } catch (error) {
      console.error('❌ Failed to fetch programs:', error);
      setError(error.response?.data?.message || 'Failed to load programs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sortPrograms = () => {
    if (!programs.length) return;

    const sorted = [...programs];
    
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'nameAsc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'nameDesc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }
    
    setFilteredPrograms(sorted);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setIsDropdownOpen(false);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'newest':
        return 'Newest First';
      case 'oldest':
        return 'Oldest First';
      case 'nameAsc':
        return 'A to Z';
      case 'nameDesc':
        return 'Z to A';
      default:
        return 'Sort By';
    }
  };

  const getSortIcon = () => {
    switch (sortBy) {
      case 'newest':
        return <FaSortAmountDown className="w-4 h-4" />;
      case 'oldest':
        return <FaSortAmountUp className="w-4 h-4" />;
      case 'nameAsc':
        return <FaSortAlphaDown className="w-4 h-4" />;
      case 'nameDesc':
        return <FaSortAlphaUp className="w-4 h-4" />;
      default:
        return <FiFilter className="w-4 h-4" />;
    }
  };

  const getProgramColor = (index) => {
    const colors = [
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
    return colors[index % colors.length];
  };

  const renderSemesters = (semesters, programId) => {
    if (!semesters || semesters.length === 0) {
      return (
        <div className="mt-6 pt-4 border-t-2 border-gray-100">
          <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <FiBookOpen className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No semesters available</p>
            <p className="text-gray-400 text-xs mt-1">Check back later for updates</p>
          </div>
        </div>
      );
    }

    const displaySemesters = semesters.slice(0, 8);
    
    const rows = [];
    for (let i = 0; i < displaySemesters.length; i += 4) {
      rows.push(displaySemesters.slice(i, i + 4));
    }

    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      while (lastRow.length < 4) {
        lastRow.push(null);
      }
    }

    const getSemesterGradient = (index) => {
      const gradients = [
        'from-blue-500 to-blue-600 border-blue-400',
        'from-purple-500 to-purple-600 border-purple-400',
        'from-pink-500 to-pink-600 border-pink-400',
        'from-green-500 to-green-600 border-green-400',
        'from-orange-500 to-orange-600 border-orange-400',
        'from-red-500 to-red-600 border-red-400',
        'from-indigo-500 to-indigo-600 border-indigo-400',
        'from-teal-500 to-teal-600 border-teal-400',
        'from-cyan-500 to-cyan-600 border-cyan-400',
        'from-amber-500 to-amber-600 border-amber-400',
      ];
      return gradients[index % gradients.length];
    };

    const getSemesterIcon = (semesterNumber) => {
      const icons = {
        1: <FaGraduationCap className="text-lg" />,
        2: <FiBook className="text-lg" />,
        3: <FiAward className="text-lg" />,
        4: <FiTrendingUp className="text-lg" />,
        5: <FiLayers className="text-lg" />,
        6: <FiGrid className="text-lg" />,
        7: <FiClock className="text-lg" />,
        8: <FiStar className="text-lg" />,
      };
      return icons[semesterNumber] || <FiBook className="text-lg" />;
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

    return (
      <div className="mt-6 pt-4 border-t-2 border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-green-100 to-orange-100 rounded-lg">
              <FiLayers className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Semester Overview
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1.5 rounded-full text-green-700 font-medium flex items-center gap-1.5 shadow-sm">
              <FiCheckCircle className="w-3 h-3" />
              {semesters.length} of 8
            </span>
          </div>
        </div>
        
        <div className="space-y-3.5">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {row.map((semester, colIndex) => {
                if (!semester) {
                  return (
                    <div 
                      key={`empty-${rowIndex}-${colIndex}`} 
                      className="px-4 py-4 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 opacity-50 backdrop-blur-sm"
                    >
                      <div className="invisible">Empty</div>
                    </div>
                  );
                }
                
                const globalIndex = rowIndex * 4 + colIndex;
                const gradient = getSemesterGradient(globalIndex);
                const icon = getSemesterIcon(semester.semesterNumber);
                const label = getSemesterLabel(semester.semesterNumber);
                
                return (
                  <Link
                    key={semester._id}
                    to={`/semester/${semester._id}`}
                    className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}>
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    </div>
                    
                    <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                    
                    <div className="relative p-4 z-10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white/80 text-lg">
                              {icon}
                            </span>
                            <span className="text-white font-bold text-sm truncate">
                              Sem {semester.semesterNumber}
                            </span>
                          </div>
                          <p className="text-white/70 text-xs font-medium truncate">
                            {label}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 text-center">
                            <span className="text-white font-bold text-xs">
                              {semester.totalBooks || 0}
                            </span>
                            <span className="text-white/70 text-[10px] ml-0.5">📚</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                          <FiArrowRight className="text-white text-xs" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {semesters.length > 8 && (
          <div className="mt-3">
            <Link
              to={`/program/${programId}`}
              className="block w-full px-4 py-3 bg-gradient-to-r from-green-50 to-orange-50 hover:from-green-100 hover:to-orange-100 rounded-xl text-sm font-semibold text-green-700 transition-all duration-300 text-center border-2 border-dashed border-green-200 hover:border-green-400 flex items-center justify-center gap-2 group"
            >
              <span>View All {semesters.length} Semesters</span>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center">
          <FaSpinner className="animate-spin h-16 w-16 text-green-500 mx-auto" />
          <p className="mt-4 text-gray-600 text-lg font-medium">Loading programs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8 border-l-4 border-red-500">
          <FiAlertCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something Went Wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchPrograms}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 mx-auto"
          >
            <FiRefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Card - Hidden on mobile (below sm breakpoint) */}
        <div className="hidden sm:block bg-white rounded-xl shadow-xl p-6 mb-8 border-l-4 border-green-500 hover:shadow-2xl transition-shadow duration-200">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              {user?.name ? (
                <span className="text-white text-2xl font-bold">
                  {user.name.charAt(0)}
                </span>
              ) : (
                <FaUserCircle className="text-white text-3xl" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaGraduationCap className="text-green-600" />
                  Welcome to GyanPark
                </h1>
                {user && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    👋 Hello, {user.name}!
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                Explore our programs, semesters, and study materials. Learn from the best resources.
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 px-3 py-1.5 rounded-full text-gray-600">
                  <FiBook className="w-3.5 h-3.5" />
                  {filteredPrograms.length} Programs
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 px-3 py-1.5 rounded-full text-gray-600">
                  <FiLayers className="w-3.5 h-3.5" />
                  {programs.reduce((acc, p) => acc + (p.totalSemesters || 0), 0)} Semesters
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 px-3 py-1.5 rounded-full text-gray-600">
                  <FiBookOpen className="w-3.5 h-3.5" />
                  {programs.reduce((acc, p) => acc + (p.totalBooks || 0), 0)} Books
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Programs Grid - Image on Top */}
        {filteredPrograms.length === 0 ? (
          <div className="bg-white rounded-xl shadow-xl p-12 text-center border-l-4 border-orange-500">
            <FiBookOpen className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Programs Available</h3>
            <p className="text-gray-600">Check back later for new programs and study materials.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPrograms.map((program, index) => (
              <div
                key={program._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 border-l-4 border-green-500"
              >
                {/* Program Image - Top */}
                <div className={`h-50 w-full bg-gradient-to-r ${getProgramColor(index)} relative`}>
                  {program.thumbnail ? (
                    <img 
                      src={program.thumbnail} 
                      alt={program.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaUniversity className="text-8xl text-white/30" />
                    </div>
                  )}
                </div>

                {/* Program Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <Link
                      to={`/program/${program._id}`}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 group whitespace-nowrap"
                    >
                      <span>View Program</span>
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  
                  <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                    {program.description}
                  </p>
                  
                  {/* Enhanced Semesters Grid */}
                  {renderSemesters(program.semesters, program._id)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;