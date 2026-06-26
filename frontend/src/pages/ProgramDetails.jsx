import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const ProgramDetails = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgramDetails();
  }, [programId]);

  const fetchProgramDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`🔍 Fetching program details for ID: ${programId}`);
      
      const response = await API.get(`/api/programs/${programId}`);
      
      console.log('📚 Program Details Response:', response.data);
      
      if (response.data.success) {
        const programData = response.data.program;
        setProgram(programData);
        setSemesters(programData.semesters || []);
        console.log(`✅ Program loaded: ${programData.title}`);
        console.log(`📚 Semesters found: ${programData.semesters?.length || 0}`);
      } else {
        setError('Failed to load program details');
      }
    } catch (error) {
      console.error('❌ Failed to fetch program:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load program details');
    } finally {
      setLoading(false);
    }
  };

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
          <p className="mt-4 text-gray-600">Loading program details...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Program Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Program not found'}</p>
          <Link 
            to="/home" 
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{program.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{program.category}</span>
                <span>•</span>
                <span>⏱️ {program.duration}</span>
                <span>•</span>
                <span>📚 {semesters.length} Semesters</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Program Description */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <p className="text-gray-600">{program.description}</p>
        </div>

        {/* Semesters Grid */}
        {semesters.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Semesters Available</h3>
            <p className="text-gray-600">Semesters for this program will be added soon.</p>
            <button
              onClick={fetchProgramDetails}
              className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {semesters.map((semester, index) => (
              <Link
                key={semester._id}
                to={`/semester/${semester._id}`}
                className={`bg-gradient-to-r ${getSemesterColor(index)} rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-white/80 font-medium">
                        Semester {semester.semesterNumber}
                      </div>
                      <h3 className="text-white font-bold text-xl mt-1 group-hover:text-white/90 transition-colors">
                        {semester.title}
                      </h3>
                    </div>
                    <div className="text-white/50 group-hover:text-white/80 transition-colors text-2xl">
                      →
                    </div>
                  </div>
                  
                  {semester.description && (
                    <p className="text-white/70 text-sm mt-2 line-clamp-2 flex-1">
                      {semester.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/20 text-white/70 text-sm">
                    <span>⏱️ {semester.duration}</span>
                    <span>•</span>
                    <span>📖 {semester.totalBooks || 0} Books</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramDetails;