// pages/Documentation.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { 
  FiBookOpen, 
  FiSearch, 
  FiChevronRight,
  FiClock,
  FiArrowLeft,
  FiGrid,
  FiList,
  FiRefreshCw
} from 'react-icons/fi';

const Documentation = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/api/admin/public/documentation');
      
      if (res.data.success) {
        setDocs(res.data.documentation || []);
        if (res.data.documentation && res.data.documentation.length > 0) {
          setSelectedDoc(res.data.documentation[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch documentation:', error);
      setError('Failed to load documentation');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (title) => {
    const icons = ['📚', '🎓', '⚙️', '💻', '📖', '🚀', '🎯', '💡'];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return icons[Math.abs(hash) % icons.length];
  };

  const getColor = (title) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600',
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const filteredDocs = docs.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.category && doc.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">😕</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchDocs}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
              <FiBookOpen className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Documentation</h1>
              <p className="text-sm text-gray-500">{docs.length} guides available</p>
            </div>
          </div>
          <Link
            to="/settings"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        {/* Search & View Controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="List View"
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>
          </div>
          {searchTerm && filteredDocs.length > 0 && (
            <p className="text-sm text-gray-500 mt-3">
              Found {filteredDocs.length} result{filteredDocs.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {docs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Documentation Available</h3>
            <p className="text-gray-500 text-sm">Check back later for guides and tutorials.</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Results Found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar - Doc List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24">
                <div className="p-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guides
                  </p>
                </div>
                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                  {filteredDocs.map((doc) => (
                    <button
                      key={doc._id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 ${
                        selectedDoc?._id === doc._id
                          ? 'bg-green-50 border-r-4 border-green-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{getIcon(doc.title)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          selectedDoc?._id === doc._id ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {doc.title}
                        </p>
                        {doc.category && (
                          <p className="text-xs text-gray-400 truncate">{doc.category}</p>
                        )}
                      </div>
                      {selectedDoc?._id === doc._id && (
                        <FiChevronRight className="w-4 h-4 text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-2">
              {selectedDoc ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className={`p-5 bg-gradient-to-r ${getColor(selectedDoc.title)}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getIcon(selectedDoc.title)}</span>
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedDoc.title}</h2>
                        {selectedDoc.category && (
                          <span className="text-sm text-white/80">{selectedDoc.category}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-white/70">
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        Updated {new Date(selectedDoc.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-6">
                    <div 
                      className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-strong:text-gray-700 prose-ul:text-gray-600 prose-li:text-gray-600 prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline"
                      dangerouslySetInnerHTML={{ __html: selectedDoc.content }}
                    />
                    
                    {/* Footer Actions */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                      <button 
                        onClick={() => window.print()}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                      >
                        🖨️ Print
                      </button>
                      <Link
                        to="/contact"
                        className="text-sm text-green-600 hover:text-green-700 transition-colors flex items-center gap-1"
                      >
                        💬 Need Help?
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="text-5xl mb-4">📖</div>
                  <p className="text-gray-500">Select a guide from the sidebar</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documentation;