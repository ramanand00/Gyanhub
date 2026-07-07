import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { 
  FiArrowLeft, 
  FiBook, 
  FiFileText, 
  FiCheckCircle,
  FiClock,
  FiTag,
  FiVideo,
  FiEye,
  FiBookOpen,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiMenu,
  FiX,
  FiDownload,
  FiMaximize2,
  FiMinimize2,
  FiFile,
  FiImage,
  FiLink,
  FiExternalLink,
  FiPaperclip,
  FiZoomIn,
  FiZoomOut,
  FiAlertCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';

// ============================================
// INLINE PDF VIEWER COMPONENT
// ============================================
const InlinePDFViewer = ({ url, title, onExpand }) => {
  const [loading, setLoading] = useState(true);
  const [viewerHeight, setViewerHeight] = useState(700);

  useEffect(() => {
    let isMounted = true;

    const estimatePdfHeight = async () => {
      if (!url) {
        if (isMounted) setViewerHeight(700);
        return;
      }

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Unable to fetch PDF');

        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const text = new TextDecoder('latin1').decode(bytes);
        const pageMatches = text.match(/\/Type\s*\/Page\b/g) || [];
        const pageCount = pageMatches.length || 1;
        const estimatedHeight = Math.min(4000, Math.max(700, pageCount * 760 + 80));

        if (isMounted) setViewerHeight(estimatedHeight);
      } catch (error) {
        console.error('Unable to estimate PDF height:', error);
        if (isMounted) setViewerHeight(700);
      }
    };

    estimatePdfHeight();
    return () => {
      isMounted = false;
    };
  }, [url]);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* PDF Header */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <FiFile className="text-red-500 text-lg flex-shrink-0" />
          <span className="font-medium text-gray-700 text-sm truncate max-w-[200px]">
            {title || 'PDF Document'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => window.open(url, '_blank')}
            className="p-1 hover:bg-gray-200 rounded transition-colors text-blue-500"
            title="Open in new tab"
          >
            <FiExternalLink className="w-4 h-4" />
          </button>
          <a
            href={url}
            download
            className="p-1 hover:bg-gray-200 rounded transition-colors text-green-500"
            title="Download PDF"
          >
            <FiDownload className="w-4 h-4" />
          </a>
          {onExpand && (
            <button
              onClick={onExpand}
              className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-500"
              title="Expand"
            >
              <FiMaximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* PDF Viewer - Sized to the document length */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: `${viewerHeight}px` }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50" style={{ minHeight: `${viewerHeight}px` }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-2 text-gray-500 text-sm">Loading PDF...</p>
            </div>
          </div>
        )}
        <iframe
          src={`${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
          width="100%"
          height={viewerHeight}
          className="w-full block"
          style={{ border: 'none' }}
          title={`PDF - ${title || 'Document'}`}
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
};

// ============================================
// ENHANCED PDF VIEWER COMPONENT (Fullscreen Modal)
// ============================================
const EnhancedPDFViewer = ({ url, title, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewerHeight, setViewerHeight] = useState(700);

  const getFileName = (url) => {
    if (!url) return 'PDF Document';
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('?')[0] || 'PDF Document';
  };

  const downloadPDF = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = getFileName(url);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const estimatePdfHeight = async () => {
      if (!url) {
        if (isMounted) setViewerHeight(700);
        return;
      }

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Unable to fetch PDF');

        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const text = new TextDecoder('latin1').decode(bytes);
        const pageMatches = text.match(/\/Type\s*\/Page\b/g) || [];
        const pageCount = pageMatches.length || 1;
        const estimatedHeight = Math.min(4000, Math.max(700, pageCount * 760 + 80));

        if (isMounted) setViewerHeight(estimatedHeight);
      } catch (error) {
        console.error('Unable to estimate PDF height:', error);
        if (isMounted) setViewerHeight(700);
      }
    };

    estimatePdfHeight();
    return () => {
      isMounted = false;
    };
  }, [url]);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
      {/* PDF Toolbar */}
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FiFile className="text-red-500 text-xl flex-shrink-0" />
          <span className="font-medium text-gray-700 truncate max-w-[300px]">
            {title || getFileName(url)}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Zoom Out"
          >
            <FiZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Zoom In"
          >
            <FiZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => downloadPDF(url)}
            className="p-1.5 hover:bg-green-100 text-green-600 rounded transition-colors"
            title="Download PDF"
          >
            <FiDownload className="w-4 h-4" />
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-blue-100 text-blue-600 rounded transition-colors"
            title="Open in new tab"
          >
            <FiExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-red-100 text-red-500 rounded transition-colors"
            title="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Viewer - Sized to the document length */}
      <div className={`flex-1 relative bg-gray-100 overflow-auto ${isFullscreen ? 'h-[calc(90vh-60px)]' : ''}`} style={{ minHeight: `${viewerHeight}px` }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{ minHeight: `${viewerHeight}px` }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-3 text-gray-600 text-sm">Loading PDF...</p>
            </div>
          </div>
        )}
        <iframe
          src={`${url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH&zoom=${zoom}`}
          width="100%"
          height={viewerHeight}
          className="w-full block"
          style={{ border: 'none' }}
          title={`PDF Viewer - ${title || 'Document'}`}
          onLoad={() => setLoading(false)}
          allowFullScreen
        />
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span className="truncate">{title || getFileName(url)}</span>
        <div className="flex items-center gap-3">
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <span>•</span>
          <span>Click to zoom in/out</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN CHAPTER DETAILS COMPONENT
// ============================================
const ChapterDetails = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  
  // State Management
  const [chapter, setChapter] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allChapters, setAllChapters] = useState([]);
  const [bookTitle, setBookTitle] = useState('');
  const [bookId, setBookId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [expandedPdf, setExpandedPdf] = useState(null);
  const [expandedAttachment, setExpandedAttachment] = useState(null);
  const [activePdfUrl, setActivePdfUrl] = useState(null);
  const [activePdfTitle, setActivePdfTitle] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchChapterDetails();
  }, [chapterId]);

  // ============================================
  // DATA FETCHING
  // ============================================
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
        setBookId(chapterData.bookId);
        setBookTitle(chapterData.bookTitle || '');
        
        if (chapterData.notes && chapterData.notes.length > 0) {
          setSelectedNote(chapterData.notes[0]);
        }
        
        console.log(`✅ Chapter loaded: ${chapterData.title}`);
        console.log(`📚 Notes found: ${chapterData.notes?.length || 0}`);
        
        if (chapterData.bookId) {
          await fetchAllChapters(chapterData.bookId, chapterData._id);
        }
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

  const fetchAllChapters = async (bookId, currentChapterId) => {
    try {
      const response = await API.get(`/api/books/${bookId}`);
      
      if (response.data.success) {
        const bookData = response.data.book;
        const chapters = bookData.chapters || [];
        setAllChapters(chapters);
      }
    } catch (error) {
      console.error('Failed to fetch book chapters:', error);
    }
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const getFileIcon = (type, format) => {
    if (type === 'image') return <FiImage className="w-4 h-4" />;
    if (type === 'raw' && format === 'pdf') return <FiFile className="w-4 h-4 text-red-500" />;
    if (type === 'video') return <FiVideo className="w-4 h-4" />;
    return <FiFile className="w-4 h-4" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const toggleChapterExpand = (chapterId) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleChapterClick = (chapterId) => {
    navigate(`/chapter/${chapterId}`);
    window.scrollTo(0, 0);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleVideoExpand = (noteId) => {
    setExpandedVideo(expandedVideo === noteId ? null : noteId);
  };

  const togglePdfExpand = (noteId) => {
    setExpandedPdf(expandedPdf === noteId ? null : noteId);
  };

  const toggleAttachmentExpand = (attachmentId) => {
    setExpandedAttachment(expandedAttachment === attachmentId ? null : attachmentId);
  };

  const openPdfViewer = (url, title) => {
    setActivePdfUrl(url);
    setActivePdfTitle(title || 'PDF Document');
  };

  const closePdfViewer = () => {
    setActivePdfUrl(null);
    setActivePdfTitle('');
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  const renderChapterItem = (chapter, index, isSubChapter = false) => {
    const isActive = chapter._id === chapterId;
    const hasSubChapters = chapter.subChapters && chapter.subChapters.length > 0;
    const isExpanded = expandedChapters.includes(chapter._id);
    
    return (
      <div key={chapter._id || index} className={`${isSubChapter ? 'ml-4' : ''}`}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          className={`
            group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200
            ${isActive 
              ? 'bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-md' 
              : 'hover:bg-gray-100 text-gray-700'
            }
            ${isSubChapter ? 'text-sm' : 'text-base'}
          `}
          onClick={() => handleChapterClick(chapter._id)}
        >
          <div className="flex-shrink-0">
            {isSubChapter ? (
              <span className="text-xs opacity-60">•</span>
            ) : (
              <FiFileText className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`font-medium truncate ${isActive ? 'text-white' : ''}`}>
                {chapter.title}
              </span>
            </div>
          </div>

          {/* REMOVED: Progress bar */}

          {hasSubChapters && !isSubChapter && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleChapterExpand(chapter._id);
              }}
              className={`p-0.5 rounded hover:bg-black/10 transition-colors ${isActive ? 'text-white/80' : 'text-gray-400'}`}
            >
              {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
            </button>
          )}
        </motion.div>

        {hasSubChapters && isExpanded && (
          <div className="ml-2 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
            {chapter.subChapters.map((subChapter, subIndex) => 
              renderChapterItem(subChapter, subIndex, true)
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // RENDER ATTACHMENT (Filter out PDFs if main PDF exists)
  // ============================================
  const renderAttachment = (attachment, index, hasMainPdf) => {
    const isExpanded = expandedAttachment === attachment._id || expandedAttachment === index;
    const fileType = attachment.type || 'file';
    const fileUrl = attachment.url || attachment;
    const fileName = attachment.name || `Attachment ${index + 1}`;
    
    // If attachment is just a string URL
    if (typeof attachment === 'string') {
      return renderSimpleAttachment(attachment, index, hasMainPdf);
    }

    // SKIP PDF if there's already a main PDF
    if (hasMainPdf && (fileType === 'pdf' || (fileType === 'raw' && attachment.format === 'pdf'))) {
      return null; // Don't render PDF attachments if main PDF exists
    }

    // If it's a PDF (and no main PDF), render inline
    if (fileType === 'pdf' || (fileType === 'raw' && attachment.format === 'pdf')) {
      return (
        <motion.div
          key={attachment._id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <InlinePDFViewer 
            url={fileUrl} 
            title={fileName}
            onExpand={() => openPdfViewer(fileUrl, fileName)}
          />
        </motion.div>
      );
    }

    // Render non-PDF attachments normally
    return (
      <motion.div
        key={attachment._id || index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
      >
        <div className="p-3 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {getFileIcon(fileType, attachment.format)}
            <span className="text-sm font-medium text-gray-700 truncate">
              {fileName}
            </span>
            {attachment.size && (
              <span className="text-xs text-gray-400 flex-shrink-0">({formatFileSize(attachment.size)})</span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {fileType === 'image' && (
              <button
                onClick={() => toggleAttachmentExpand(attachment._id || index)}
                className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-500"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
              </button>
            )}
            <a
              href={fileUrl}
              download={fileName}
              className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-500"
              title="Download"
            >
              <FiDownload className="w-4 h-4" />
            </a>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-500"
              title="Open in new tab"
            >
              <FiExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="p-3 bg-white">
          {fileType === 'image' ? (
            <div className={`${isExpanded ? 'max-w-4xl mx-auto' : ''}`}>
              <img
                src={fileUrl}
                alt={fileName}
                className={`rounded-lg object-contain w-full ${isExpanded ? 'max-h-[600px]' : 'max-h-[300px]'} cursor-pointer hover:opacity-90 transition-opacity`}
                onClick={() => toggleAttachmentExpand(attachment._id || index)}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                }}
              />
            </div>
          ) : fileType === 'video' ? (
            <div className="aspect-video">
              <video
                src={fileUrl}
                controls
                className="w-full h-full rounded-lg"
                controlsList="nodownload"
              />
            </div>
          ) : fileType === 'audio' ? (
            <audio
              src={fileUrl}
              controls
              className="w-full"
            />
          ) : (
            <div className="text-center py-8">
              <FiFile className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">File preview not available</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Open File
              </a>
            </div>
          )}
        </div>

        {attachment.description && (
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-600">{attachment.description}</p>
          </div>
        )}
      </motion.div>
    );
  };

  // ============================================
  // RENDER SIMPLE ATTACHMENT (Filter out PDFs if main PDF exists)
  // ============================================
  const renderSimpleAttachment = (url, index, hasMainPdf) => {
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
    const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
    const isPDF = /\.pdf$/i.test(url);
    const isAudio = /\.(mp3|wav|ogg|m4a)$/i.test(url);
    
    // SKIP PDF if there's already a main PDF
    if (hasMainPdf && isPDF) {
      return null; // Don't render PDF attachments if main PDF exists
    }
    
    if (isPDF) {
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <InlinePDFViewer 
            url={url} 
            title={`PDF Document ${index + 1}`}
            onExpand={() => openPdfViewer(url, `PDF Document ${index + 1}`)}
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="border border-gray-200 rounded-xl overflow-hidden"
      >
        {isImage ? (
          <div className="p-3">
            <img
              src={url}
              alt={`Attachment ${index + 1}`}
              className="max-h-[400px] w-full object-contain rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
              }}
            />
          </div>
        ) : isVideo ? (
          <div className="p-3 aspect-video">
            <video
              src={url}
              controls
              className="w-full h-full rounded-lg"
            />
          </div>
        ) : isAudio ? (
          <div className="p-4">
            <audio
              src={url}
              controls
              className="w-full"
            />
          </div>
        ) : (
          <div className="p-4 text-center">
            <FiFile className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm mb-3">File preview not available</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Open File
            </a>
          </div>
        )}
      </motion.div>
    );
  };

  // ============================================
  // RENDER PDF PREVIEW IN NOTE (Main PDF - Only One)
  // ============================================
  const renderNotePdfPreview = (note) => {
    if (!note.pdfUrl) return null;

    return (
      <div className="mb-6">
        <InlinePDFViewer 
          url={note.pdfUrl} 
          title={note.pdfTitle || note.title || 'PDF Document'}
          onExpand={() => openPdfViewer(note.pdfUrl, note.pdfTitle || note.title || 'PDF Document')}
        />
      </div>
    );
  };

  // ============================================
  // RENDER VIDEO PLAYER
  // ============================================
  const renderVideoPlayer = (note, noteIndex) => {
    if (!note.videoUrl) return null;
    
    const isExpanded = expandedVideo === note._id;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-md"
      >
        <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FiVideo className="text-red-500 text-xl" />
            <h4 className="font-semibold text-gray-800">Video Lecture {noteIndex + 1}</h4>
            {note.videoTitle && (
              <span className="text-sm text-gray-500">- {note.videoTitle}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {note.videoDuration && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                {note.videoDuration}
              </span>
            )}
            <button
              onClick={() => toggleVideoExpand(note._id)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className={`p-4 ${isExpanded ? 'bg-black/5' : ''}`}>
          <div className={`w-full ${isExpanded ? 'max-w-4xl mx-auto' : ''}`}>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <ReactPlayer
                url={note.videoUrl}
                width="100%"
                height="100%"
                controls
                playing={false}
                config={{
                  youtube: {
                    playerVars: { 
                      showinfo: 1, 
                      rel: 0, 
                      modestbranding: 1,
                      origin: window.location.origin 
                    }
                  }
                }}
                className="absolute top-0 left-0"
              />
            </div>
          </div>
          
          {note.videoDescription && (
            <div className={`mt-3 p-3 bg-white rounded-lg ${isExpanded ? 'max-w-4xl mx-auto' : ''}`}>
              <p className="text-sm text-gray-600">{note.videoDescription}</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // ============================================
  // RENDER NOTE CONTENT
  // ============================================
  const renderNoteContent = (note, noteIndex) => {
    // Check if note has a main PDF
    const hasMainPdf = !!note.pdfUrl;

    return (
      <motion.div
        key={note._id || noteIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: noteIndex * 0.05 }}
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      >
        {/* Note Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="text-xl font-semibold text-gray-800">{note.title}</h3>
                {note.isImportant && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">⭐ Important</span>
                )}
                {note.noteType && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">{note.noteType}</span>
                )}
              </div>
              
              {note.description && (
                <p className="text-gray-500 text-sm">{note.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {note.downloadUrl && (
                <a
                  href={note.downloadUrl}
                  download
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-green-600"
                  title="Download Note"
                >
                  <FiDownload className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Note Content */}
        <div className="p-6">
          {/* Text Content */}
          {note.content && (
            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-sm whitespace-pre-line mb-4">
              {note.content}
            </div>
          )}

          {/* PDF Preview - ONLY ONE MAIN PDF */}
          {note.pdfUrl && renderNotePdfPreview(note)}

          {/* Video Player */}
          {note.videoUrl && renderVideoPlayer(note, noteIndex)}

          {/* Attachments - PDFs will be skipped if main PDF exists */}
          {note.attachments && note.attachments.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FiPaperclip className="w-4 h-4" />
                Attachments ({note.attachments.filter(att => {
                  // Filter out PDFs if main PDF exists
                  if (hasMainPdf) {
                    const isPdf = att.type === 'pdf' || (att.type === 'raw' && att.format === 'pdf');
                    if (typeof att === 'string') {
                      return !/\.pdf$/i.test(att);
                    }
                    return !isPdf;
                  }
                  return true;
                }).length})
              </h5>
              <div className="space-y-3">
                {note.attachments.map((att, index) => renderAttachment(att, index, hasMainPdf))}
              </div>
            </div>
          )}

          {/* Links */}
          {note.links && note.links.length > 0 && note.links.some(link => link.url) && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiLink className="w-4 h-4" />
                Useful Links
              </h5>
              <div className="flex flex-wrap gap-3">
                {note.links.map((link, i) => (
                  link.url && (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1 hover:underline transition-colors"
                    >
                      <FiExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate max-w-[200px]">{link.title || link.url}</span>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {note.tags && note.tags.length > 0 && note.tags.some(tag => tag) && (
            <div className="flex flex-wrap gap-1.5">
              {note.tags.map((tag, i) => (
                tag && (
                  <span key={i} className="px-2.5 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full">
                    #{tag}
                  </span>
                )
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
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
      <div className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => navigate(`/book/${chapter.bookId}`)}
              className="text-gray-600 hover:text-gray-800 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate">
                {chapter.programTitle} • Semester {chapter.semesterNumber}
              </p>
              <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">
                {chapter.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {allChapters.length > 0 && (
                <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">
                    {allChapters.findIndex(c => c._id === chapterId) + 1}
                  </span>
                  <span>/</span>
                  <span>{allChapters.length}</span>
                </div>
              )}
              <button
                onClick={fetchChapterDetails}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                title="Refresh"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 relative">
          {/* Sidebar */}
          <AnimatePresence>
            {(sidebarOpen || !isMobile) && (
              <motion.div
                initial={{ x: isMobile ? -300 : 0, opacity: isMobile ? 0 : 1 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`
                  ${isMobile ? 'fixed inset-y-0 left-0 z-30 w-72' : 'relative w-72 flex-shrink-0'}
                `}
              >
                <div className={`
                  h-full bg-white shadow-xl rounded-xl overflow-hidden
                  ${isMobile ? 'mt-14 mx-4' : ''}
                `}>
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-orange-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <FiBook className="w-5 h-5 text-green-600" />
                      <span className="truncate">{bookTitle || 'Chapters'}</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {allChapters.length} chapters • {chapter.bookTitle || ''}
                    </p>
                  </div>

                  <div className="h-[calc(100%-60px)] overflow-y-auto p-3 space-y-1">
                    {allChapters.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <FiBookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No chapters available</p>
                      </div>
                    ) : (
                      allChapters.map((ch, index) => renderChapterItem(ch, index))
                    )}
                  </div>
                </div>

                {isMobile && (
                  <div 
                    className="fixed inset-0 bg-black/20 -z-10"
                    onClick={() => setSidebarOpen(false)}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content - Notes first, then Chapter Info */}
          <div className="flex-1 min-w-0">
            {/* NOTES SECTION - AT TOP */}
            {notes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center mb-8">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Notes Available</h3>
                <p className="text-gray-600">Notes for this chapter will be added soon.</p>
                <button
                  onClick={fetchChapterDetails}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <div className="space-y-8 mb-8">
                {notes.map((note, noteIndex) => renderNoteContent(note, noteIndex))}
              </div>
            )}

            {/* CHAPTER INFO SECTION - AT BOTTOM (REMOVED COMPLETED BADGE) */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-sm bg-gradient-to-r from-green-100 to-orange-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                  Chapter {chapter.chapterNumber}
                </span>
                {/* REMOVED: Completed badge */}
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">{chapter.title}</h2>
              
              {chapter.description && (
                <p className="text-gray-600 mb-4">{chapter.description}</p>
              )}
              
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

              {chapter.topics && chapter.topics.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">📌 Topics Covered</h4>
                  <div className="flex flex-wrap gap-2">
                    {chapter.topics.map((topic, i) => (
                      topic && (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                          <FiTag className="w-3 h-3" />
                          {topic}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal (Fullscreen) */}
      <AnimatePresence>
        {activePdfUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closePdfViewer}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <EnhancedPDFViewer
                url={activePdfUrl}
                title={activePdfTitle}
                onClose={closePdfViewer}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChapterDetails;