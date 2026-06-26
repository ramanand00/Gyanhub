// pages/SemesterDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const SemesterDetails = () => {
  const { semesterId } = useParams();
  const navigate = useNavigate();
  const [semester, setSemester] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSemesterDetails();
  }, [semesterId]);

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

  const getBookColor = (index) => {
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
          <p className="mt-4 text-gray-600">Loading semester details...</p>
        </div>
      </div>
    );
  }

  if (error || !semester) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Semester Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Semester not found'}</p>
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
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="text-sm text-gray-500">Semester {semester.semesterNumber}</p>
                  <h1 className="text-2xl font-bold text-gray-800">{semester.title}</h1>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span>⏱️ {semester.duration}</span>
                <span>•</span>
                <span>📖 {books.length} Books</span>
                <span>•</span>
                <span>🏫 {semester.programTitle}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Semester Description */}
      {semester.description && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <p className="text-gray-600">{semester.description}</p>
          </div>
        </div>
      )}

      {/* Books Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {books.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Books Available</h3>
            <p className="text-gray-600">Books for this semester will be added soon.</p>
            <button
              onClick={fetchSemesterDetails}
              className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book, index) => (
              <Link
                key={book._id}
                to={`/book/${book._id}`}
                className={`bg-gradient-to-r ${getBookColor(index)} rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group`}
              >
                {/* Book Cover */}
                <div className="h-48 relative">
                  {book.bookCover ? (
                    <img 
                      src={book.bookCover} 
                      alt={book.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-white/30">
                      📖
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <span>📝 {book.totalChapters || 0} Chapters</span>
                    </div>
                  </div>
                </div>
                
                {/* Book Info */}
                <div className="p-4 text-white">
                  <h3 className="font-semibold text-lg group-hover:text-white/90 transition-colors line-clamp-2">
                    {book.title}
                  </h3>
                  
                  {book.description && (
                    <p className="text-white/70 text-sm mt-1 line-clamp-2">
                      {book.description}
                    </p>
                  )}
                  
                  {book.authors && book.authors.length > 0 && book.authors[0] && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {book.authors.slice(0, 2).map((author, i) => (
                        author && (
                          <span key={i} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                            ✍️ {author}
                          </span>
                        )
                      ))}
                      {book.authors.length > 2 && (
                        <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                          +{book.authors.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/20">
                    <span className="text-sm text-white/70">
                      📝 {book.totalChapters || 0} chapters
                    </span>
                    <span className="text-white font-medium text-sm group-hover:text-white/90 transition-colors">
                      View Book →
                    </span>
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

export default SemesterDetails;