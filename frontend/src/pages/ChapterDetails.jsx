import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const ChapterDetails = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChapterDetails();
  }, [chapterId]);

  const fetchChapterDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`🔍 Fetching chapter details for ID: ${chapterId}`);
      
      const response = await API.get(`/api/chapters/${chapterId}`);
      
      console.log('📚 Chapter Details Response:', response.data);
      
      if (response.data.success) {
        const chapterData = response.data.chapter;
        setChapter(chapterData);
        setNotes(chapterData.notes || []);
        console.log(`✅ Chapter loaded: ${chapterData.title}`);
        console.log(`📚 Notes found: ${chapterData.notes?.length || 0}`);
      } else {
        setError('Failed to load chapter details');
      }
    } catch (error) {
      console.error('❌ Failed to fetch chapter:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load chapter details');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'pdf': return '📄';
      case 'video': return '🎬';
      default: return '📎';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chapter details...</p>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chapter Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Chapter not found'}</p>
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
              onClick={() => navigate(`/book/${chapter.bookId}`)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                {chapter.programTitle} • Semester {chapter.semesterNumber}: {chapter.semesterTitle} • {chapter.bookTitle}
              </p>
              <h1 className="text-2xl font-bold text-gray-800">
                Chapter {chapter.chapterNumber}: {chapter.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Chapter Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          {chapter.description && (
            <p className="text-gray-600 mb-4">{chapter.description}</p>
          )}
          
          {/* What You'll Learn */}
          {chapter.whatYouWillLearn && chapter.whatYouWillLearn.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-green-700 mb-2">🎯 What You'll Learn</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {chapter.whatYouWillLearn.map((item, i) => (
                  item && (
                    <li key={i} className="text-sm text-green-600 flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      {item}
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}

          {/* Topics */}
          {chapter.topics && chapter.topics.length > 0 && (
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">📌 Topics Covered</h4>
              <div className="flex flex-wrap gap-2">
                {chapter.topics.map((topic, i) => (
                  topic && (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {topic}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {notes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Notes Available</h3>
            <p className="text-gray-600">Notes for this chapter will be added soon.</p>
            <button
              onClick={fetchChapterDetails}
              className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {notes.map((note) => (
              <div key={note._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">{note.title}</h3>
                      {note.isImportant && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">⭐ Important</span>
                      )}
                    </div>
                    
                    {note.description && (
                      <p className="text-gray-500 text-sm mb-3">{note.description}</p>
                    )}
                    
                    {/* Content */}
                    {note.content && (
                      <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-sm whitespace-pre-line mb-3">
                        {note.content}
                      </div>
                    )}

                    {/* Attachments */}
                    {note.attachments && note.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {note.attachments.map((att, i) => (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm text-gray-700"
                          >
                            {getFileIcon(att.type)} {att.name} {att.size && `(${formatFileSize(att.size)})`}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Video */}
                    {note.videoUrl && (
                      <div className="mb-3">
                        <video src={note.videoUrl} controls className="w-full max-h-96 rounded-lg" />
                      </div>
                    )}

                    {/* PDF */}
                    {note.pdfUrl && (
                      <div className="mb-3">
                        <a
                          href={note.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          📄 View PDF
                        </a>
                      </div>
                    )}

                    {/* Links */}
                    {note.links && note.links.length > 0 && note.links[0]?.url && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {note.links.map((link, i) => (
                          link.url && (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600 text-sm underline"
                            >
                              🔗 {link.title || link.url}
                            </a>
                          )
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && note.tags[0] && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag, i) => (
                          tag && (
                            <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full">
                              #{tag}
                            </span>
                          )
                        ))}
                      </div>
                    )}
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

export default ChapterDetails;