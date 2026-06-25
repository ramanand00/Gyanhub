import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await API.get('/api/programs', {
        params: { limit: 20 }
      });
      console.log('📚 Programs fetched:', res.data.programs);
      setPrograms(res.data.programs || []);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get random color for semester cards
  const getSemesterColor = (index) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600',
      'from-cyan-500 to-cyan-600',
      'from-amber-500 to-amber-600',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading programs...</p>
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
              <div className="flex items-center gap-2 text-green-200">
                <span className="text-2xl">👋</span>
                <span>Welcome back, {user.name}!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Programs Section */}
        {programs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Programs Available</h3>
            <p className="text-gray-600">Check back later for new programs and study materials.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {programs.map((program, programIndex) => (
              <div key={program._id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Program Header */}
                <div className="relative h-48 bg-gradient-to-r from-green-600 to-green-800">
                  <img
                    src={program.thumbnail || 'https://via.placeholder.com/1200x300/059669/ffffff?text=Program'}
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-6">
                      <h2 className="text-3xl font-bold text-white">{program.title}</h2>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                          {program.category}
                        </span>
                        <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                          ⏱️ {program.duration}
                        </span>
                        <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                          📚 {program.semesters?.length || 0} Semesters
                        </span>
                      </div>
                      <p className="text-white/80 text-sm mt-2 max-w-2xl line-clamp-2">
                        {program.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Semesters Grid - ALL semesters shown here */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <span className="text-2xl mr-2">📚</span> All Semesters
                    </h3>
                    <span className="text-sm text-gray-500">
                      {program.semesters?.length || 0} semesters available
                    </span>
                  </div>
                  
                  {program.semesters && program.semesters.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {program.semesters.map((semester, index) => (
                        <Link
                          key={semester._id}
                          to={`/semester/${semester._id}`}
                          className={`bg-gradient-to-r ${getSemesterColor(index)} rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-sm text-white/80 font-medium">
                                Semester {semester.semesterNumber}
                              </div>
                              <h4 className="text-white font-semibold text-lg mt-1 group-hover:text-white/90 transition-colors line-clamp-1">
                                {semester.title}
                              </h4>
                              <div className="flex items-center gap-3 mt-2 text-white/70 text-sm">
                                <span>⏱️ {semester.duration}</span>
                                <span>📖 {semester.totalBooks || 0} Books</span>
                              </div>
                            </div>
                            <div className="text-white/50 group-hover:text-white/80 transition-colors text-2xl ml-2">
                              →
                            </div>
                          </div>
                          {semester.description && (
                            <p className="text-white/60 text-sm mt-2 line-clamp-1">
                              {semester.description}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <p className="text-gray-500">No semesters available for this program yet.</p>
                    </div>
                  )}
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