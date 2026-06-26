import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const BookDetails = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

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

  const getChapterColor = (index) => {
    const colors = [
      'border-blue-500 bg-blue-50',
      'border-purple-500 bg-purple-50',
      'border-pink-500 bg-pink-50',
      'border-green-500 bg-green-50',
      'border-orange-500 bg-orange-50',
      'border-red-500 bg-red-50',
      'border-indigo-500 bg-indigo-50',
      'border-teal-500 bg-teal-50',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Book Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Book not found'}</p>
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
              onClick={() => navigate(`/semester/${book.semesterId}`)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {book.bookCover ? (
                  <img 
                    src={book.bookCover} 
                    alt={book.title} 
                    className="w-12 h-16 object-cover rounded shadow"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-3xl">📖</span>
                )}
                <div>
                  <p className="text-sm text-gray-500">
                    {book.programTitle} • Semester {book.semesterNumber}: {book.semesterTitle}
                  </p>
                  <h1 className="text-2xl font-bold text-gray-800">{book.title}</h1>
                </div>
              </div>
              {book.authors && book.authors.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 ml-16">
                  {book.authors.map((author, i) => (
                    author && (
                      <span key={i} className="text-xs text-gray-500">
                        {i > 0 && ', '}✍️ {author}
                      </span>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Book Description */}
      {book.description && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <p className="text-gray-600">{book.description}</p>
          </div>
        </div>
      )}

      {/* Chapters Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {chapters.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Chapters Available</h3>
            <p className="text-gray-600">Chapters for this book will be added soon.</p>
            <button
              onClick={fetchBookDetails}
              className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapters.map((chapter, index) => (
              <Link
                key={chapter._id}
                to={`/chapter/${chapter._id}`}
                className={`border-l-4 ${getChapterColor(index)} bg-white rounded-r-xl shadow-md p-5 hover:shadow-lg transition-all duration-300 hover:translate-x-1 group`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-400">#{chapter.chapterNumber}</span>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                        {chapter.title}
                      </h3>
                    </div>
                    {chapter.description && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                        {chapter.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                      <span>📝 {chapter.totalNotes || 0} Notes</span>
                      {chapter.topics && chapter.topics.length > 0 && (
                        <span>• {chapter.topics.length} Topics</span>
                      )}
                    </div>
                  </div>
                  <div className="text-green-500 group-hover:text-green-600 transition-colors text-xl ml-4">
                    →
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

export default BookDetails;