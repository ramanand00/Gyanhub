// pages/Home.jsx
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

  const getSemesterColor = (index) => {
    const colors = [
      'border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700',
      'border-purple-500 bg-purple-50 hover:bg-purple-100 text-purple-700',
      'border-pink-500 bg-pink-50 hover:bg-pink-100 text-pink-700',
      'border-green-500 bg-green-50 hover:bg-green-100 text-green-700',
      'border-orange-500 bg-orange-50 hover:bg-orange-100 text-orange-700',
      'border-red-500 bg-red-50 hover:bg-red-100 text-red-700',
      'border-indigo-500 bg-indigo-50 hover:bg-indigo-100 text-indigo-700',
      'border-teal-500 bg-teal-50 hover:bg-teal-100 text-teal-700',
      'border-cyan-500 bg-cyan-50 hover:bg-cyan-100 text-cyan-700',
      'border-amber-500 bg-amber-50 hover:bg-amber-100 text-amber-700',
    ];
    return colors[index % colors.length];
  };

  const getSemesterIcon = (semesterNumber) => {
    const icons = [
      <FiStar key="star" className="text-lg" />,
      <FiBook key="book" className="text-lg" />,
      <FiAward key="award" className="text-lg" />,
      <FiTrendingUp key="trending" className="text-lg" />,
      <FiLayers key="layers" className="text-lg" />,
      <FiGrid key="grid" className="text-lg" />,
      <FiClock key="clock" className="text-lg" />,
      <FiThumbsUp key="thumbsup" className="text-lg" />
    ];
    return icons[(semesterNumber - 1) % icons.length];
  };

  const renderSemesters = (semesters, programId) => {
    if (!semesters || semesters.length === 0) {
      return (
        <div className="mt-6 pt-4 border-t-2 border-gray-100">
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <FiBookOpen className="text-3xl text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No semesters available</p>
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

    return (
      <div className="mt-5 pt-4 border-t-2 border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
            <FiLayers className="w-4 h-4" />
            Semesters
          </p>
          <span className="text-xs bg-gradient-to-r from-green-100 to-orange-100 px-3 py-1 rounded-full text-gray-700 font-medium flex items-center gap-1">
            <FiBook className="w-3 h-3" />
            {semesters.length} of 8
          </span>
        </div>
        
        <div className="space-y-3">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-4 gap-3">
              {row.map((semester, colIndex) => {
                if (!semester) {
                  return (
                    <div 
                      key={`empty-${rowIndex}-${colIndex}`} 
                      className="px-4 py-3.5 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 opacity-50"
                    >
                      <div className="invisible">Empty</div>
                    </div>
                  );
                }
                
                const globalIndex = rowIndex * 4 + colIndex;
                const semesterColor = getSemesterColor(globalIndex);
                const icon = getSemesterIcon(semester.semesterNumber);
                
                return (
                  <Link
                    key={semester._id}
                    to={`/semester/${semester._id}`}
                    className={`px-3 py-4 border-l-4 ${semesterColor} rounded-r-lg font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02] group flex flex-col items-center justify-center text-center`}
                  >
                    <div className="flex flex-col items-center w-full">
                      <div className="flex items-center gap-1.5 w-full justify-center">
                        <span className="text-lg">{icon}</span>
                        <span className="font-bold text-sm">
                          Sem {semester.semesterNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-500">
                          {semester.totalBooks || 0}
                        </span>
                        <FiBook className="text-xs text-gray-400" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {semesters.length === 8 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
              <FiCheckCircle className="text-sm" />
              All 8 semesters available
            </span>
          </div>
        )}

        {semesters.length > 8 && (
          <div className="mt-3">
            <Link
              to={`/program/${programId}`}
              className="block w-full px-4 py-2.5 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg text-sm font-medium text-green-700 hover:from-green-100 hover:to-orange-100 transition-all text-center border-2 border-dashed border-green-200 flex items-center justify-center gap-2"
            >
              View All {semesters.length} Semesters
              <FiArrowRight className="w-4 h-4" />
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
        {/* Welcome Card - Styled like Contact page header */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border-l-4 border-green-500 hover:shadow-2xl transition-shadow duration-200">
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

        {/* Sorting Controls - Clean card design */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8 flex flex-wrap items-center justify-between gap-4 border-t-4 border-orange-500 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiGrid className="text-lg text-green-600" />
              <span className="bg-gradient-to-r from-green-100 to-orange-100 px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                {filteredPrograms.length} programs
              </span>
            </span>
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold text-sm hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <FiFilter className="w-4 h-4" />
              <span>Sort: {getSortLabel()}</span>
              {getSortIcon()}
              <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="py-1">
                  <button
                    onClick={() => handleSortChange('newest')}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3 ${
                      sortBy === 'newest'
                        ? 'bg-green-50 text-green-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FaSortAmountDown className="text-lg" />
                    <span>Newest First</span>
                    {sortBy === 'newest' && (
                      <FiCheckCircle className="ml-auto text-green-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSortChange('oldest')}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3 ${
                      sortBy === 'oldest'
                        ? 'bg-green-50 text-green-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FaSortAmountUp className="text-lg" />
                    <span>Oldest First</span>
                    {sortBy === 'oldest' && (
                      <FiCheckCircle className="ml-auto text-green-600" />
                    )}
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => handleSortChange('nameAsc')}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3 ${
                      sortBy === 'nameAsc'
                        ? 'bg-green-50 text-green-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FaSortAlphaDown className="text-lg" />
                    <span>A to Z</span>
                    {sortBy === 'nameAsc' && (
                      <FiCheckCircle className="ml-auto text-green-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSortChange('nameDesc')}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3 ${
                      sortBy === 'nameDesc'
                        ? 'bg-green-50 text-green-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FaSortAlphaUp className="text-lg" />
                    <span>Z to A</span>
                    {sortBy === 'nameDesc' && (
                      <FiCheckCircle className="ml-auto text-green-600" />
                    )}
                  </button>
                </div>
              </div>
            )}
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
                <div className={`h-56 w-full bg-gradient-to-r ${getProgramColor(index)} relative`}>
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
                  
                  {/* Overlay badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg">
                      {program.category}
                    </span>
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {program.duration || '4 Years'}
                    </span>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                    <span className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                      <FiLayers className="w-3 h-3" />
                      {program.totalSemesters || 0} Semesters
                    </span>
                    <span className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                      <FiBook className="w-3 h-3" />
                      {program.totalBooks || 0} Books
                    </span>
                    <span className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      {new Date(program.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Program Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FiBookOpen className="text-green-600" />
                        {program.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <FiHash className="w-3 h-3" />
                          ID: {program._id.slice(-6)}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <FiEdit3 className="w-3 h-3" />
                          Updated: {new Date(program.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
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
                  
                  {/* Semesters Grid */}
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