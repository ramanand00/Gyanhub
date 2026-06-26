// pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';

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
      console.log('🔄 Fetching programs...');
      
      const response = await API.get('/api/programs', {
        params: { limit: 50 }
      });
      
      console.log('📚 Programs Response:', response.data);
      
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
        return '🆕 Newest First';
      case 'oldest':
        return '📅 Oldest First';
      case 'nameAsc':
        return '🔤 A to Z';
      case 'nameDesc':
        return '🔤 Z to A';
      default:
        return 'Sort By';
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
    const icons = ['🌟', '📚', '🎯', '💡', '🚀', '🎨', '⚡', '🏆'];
    return icons[(semesterNumber - 1) % icons.length];
  };

  const renderSemesters = (semesters, programId) => {
    if (!semesters || semesters.length === 0) {
      return (
        <div className="mt-6 pt-4 border-t-2 border-gray-100">
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <span className="text-4xl block mb-2">📭</span>
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
            <span>📚</span> Semesters
          </p>
          <span className="text-xs bg-gradient-to-r from-green-100 to-orange-100 px-3 py-1 rounded-full text-gray-700 font-medium">
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
                        <span className="text-xs text-gray-400">📖</span>
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
              <span className="text-sm">✅</span> All 8 semesters available
            </span>
          </div>
        )}

        {semesters.length > 8 && (
          <div className="mt-3">
            <Link
              to={`/program/${programId}`}
              className="block w-full px-4 py-2.5 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg text-sm font-medium text-green-700 hover:from-green-100 hover:to-orange-100 transition-all text-center border-2 border-dashed border-green-200"
            >
              View All {semesters.length} Semesters →
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg font-medium">Loading programs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something Went Wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchPrograms}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to <span className="text-orange-300">GyanPark</span>
            </h1>
            <p className="text-xl text-green-100 mb-6">
              Explore our programs, semesters, and study materials. Learn from the best resources.
            </p>
            {user && (
              <div className="flex items-center gap-2 text-green-200 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full inline-flex">
                <span className="text-2xl">👋</span>
                <span>Welcome back, {user.name}!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Sorting Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-lg">📊</span> 
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {filteredPrograms.length} programs
              </span>
            </span>
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold text-sm hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <span>Sort By</span>
              <span className="text-base">{getSortLabel()}</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 transition-all duration-200 ease-out origin-top-right">
                <div className="py-1">
                  <button
                    onClick={() => handleSortChange('newest')}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3 ${
                      sortBy === 'newest'
                        ? 'bg-green-50 text-green-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">🆕</span>
                    <span>Newest First</span>
                    {sortBy === 'newest' && (
                      <span className="ml-auto text-green-600">✓</span>
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
                    <span className="text-lg">📅</span>
                    <span>Oldest First</span>
                    {sortBy === 'oldest' && (
                      <span className="ml-auto text-green-600">✓</span>
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
                    <span className="text-lg">🔤</span>
                    <span>A to Z</span>
                    {sortBy === 'nameAsc' && (
                      <span className="ml-auto text-green-600">✓</span>
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
                    <span className="text-lg">🔤</span>
                    <span>Z to A</span>
                    {sortBy === 'nameDesc' && (
                      <span className="ml-auto text-green-600">✓</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Programs Grid */}
        {filteredPrograms.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-7xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Programs Available</h3>
            <p className="text-gray-600">Check back later for new programs and study materials.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredPrograms.map((program, index) => (
              <div
                key={program._id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 w-full"
              >
                {/* Program Header */}
                <div className={`h-64 bg-gradient-to-r ${getProgramColor(index)} relative w-full`}>
                  {program.thumbnail ? (
                    <img 
                      src={program.thumbnail} 
                      alt={program.title} 
                      className="w-full h-full object-cover transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-9xl">
                      🎓
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                      <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
                        <span className="text-xl">📚</span>
                        {program.totalSemesters || 0} Semesters
                      </span>
                      <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
                        <span className="text-xl">📖</span>
                        {program.totalBooks || 0} Books
                      </span>
                      <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
                        <span className="text-xl">🏷️</span>
                        {program.category}
                      </span>
                      <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs">
                        <span>📅</span>
                        {new Date(program.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Program Info */}
                <div className="p-6 flex-1 flex flex-col w-full">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800">
                        {program.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                          ⏱️ {program.duration}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          🆔 {program._id.slice(-6)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs text-gray-400">
                      <span className="bg-gray-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                        <span>📅 Created</span>
                        <span className="font-medium text-gray-600">
                          {new Date(program.createdAt).toLocaleDateString()}
                        </span>
                      </span>
                      <span className="bg-gray-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                        <span>🔄 Updated</span>
                        <span className="font-medium text-gray-600">
                          {new Date(program.updatedAt).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-base mt-3 line-clamp-2">
                    {program.description}
                  </p>
                  
                  {/* Semesters Grid */}
                  {renderSemesters(program.semesters, program._id)}
                  
                  <div className="mt-5 flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <Link
                      to={`/program/${program._id}`}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
                    >
                      <span>Explore Full Program</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-400">📊</span>
                      <span className="text-gray-600 font-medium">
                        {program.totalSemesters || 0} Semesters
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-600 font-medium">
                        {program.totalBooks || 0} Books
                      </span>
                    </div>
                  </div>
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