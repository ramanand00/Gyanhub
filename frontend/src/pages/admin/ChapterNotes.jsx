import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';
import { FiX } from 'react-icons/fi';

const ChapterNotes = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    attachments: [],
    videoUrl: '',
    pdfUrl: '',
    links: [{ title: '', url: '' }],
    tags: [''],
    isImportant: false,
    order: 0,
  });

  useEffect(() => {
    fetchChapterAndNotes();
  }, [chapterId]);

  const fetchChapterAndNotes = async () => {
    setLoading(true);
    try {
      const chapterRes = await API.get(`/api/admin/chapters/${chapterId}`);
      setChapter(chapterRes.data.chapter);
      const notesRes = await API.get(`/api/admin/chapters/${chapterId}/notes`);
      setNotes(notesRes.data.notes);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection and convert to base64
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingFiles(prev => [...prev, ...validFiles.map(f => f.name)]);
    
    try {
      // Convert files to base64
      const processedFiles = await Promise.all(
        validFiles.map(async (file) => {
          const base64 = await fileToBase64(file);
          
          // Determine file type
          let type = 'file';
          if (file.type.startsWith('image/')) {
            type = 'image';
          } else if (file.type === 'application/pdf') {
            type = 'pdf';
          } else if (file.type.startsWith('video/')) {
            type = 'video';
          }

          return {
            url: base64,
            type: type,
            name: file.name,
            size: file.size,
            mimeType: file.type,
          };
        })
      );
      
      // Update form data with processed files
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...processedFiles]
      }));

      // If it's a PDF, automatically set pdfUrl
      const pdfFiles = processedFiles.filter(f => f.type === 'pdf');
      if (pdfFiles.length > 0 && !formData.pdfUrl) {
        setFormData(prev => ({
          ...prev,
          pdfUrl: pdfFiles[0].url
        }));
      }

    } catch (error) {
      console.error('File processing error:', error);
      alert('Failed to process files. Please try again.');
    } finally {
      setUploadingFiles([]);
      e.target.value = ''; // Reset input
    }
  };

  // Helper: Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRemoveAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || formData.title.trim() === '') {
      alert('Please enter a note title');
      return;
    }
    
    setSaving(true);
    setUploadProgress(0);
    
    try {
      // Prepare the data for submission
      const submitData = {
        chapterId: chapterId,
        title: formData.title.trim(),
        description: formData.description || '',
        content: formData.content || '',
        attachments: formData.attachments || [],
        videoUrl: formData.videoUrl || '',
        pdfUrl: formData.pdfUrl || '',
        links: formData.links || [],
        tags: formData.tags || [],
        isImportant: formData.isImportant || false,
        order: parseInt(formData.order) || 0,
      };
      
      console.log('📤 Submitting note data:', submitData);
      
      let response;
      if (editingNote) {
        response = await API.put(`/api/admin/notes/${editingNote._id}`, submitData);
      } else {
        response = await API.post('/api/admin/notes', submitData);
      }
      
      if (response.data.success) {
        setShowModal(false);
        setEditingNote(null);
        resetForm();
        fetchChapterAndNotes();
        setUploadProgress(100);
      }
    } catch (error) {
      console.error('❌ Failed to save note:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      attachments: [],
      videoUrl: '',
      pdfUrl: '',
      links: [{ title: '', url: '' }],
      tags: [''],
      isImportant: false,
      order: 0,
    });
    setUploadProgress(0);
    setUploadingFiles([]);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await API.delete(`/api/admin/notes/${id}`);
      fetchChapterAndNotes();
    } catch (error) {
      alert('Failed to delete note');
    }
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...formData.links];
    newLinks[index][field] = value;
    setFormData({ ...formData, links: newLinks });
  };

  const handleAddLink = () => {
    setFormData({ ...formData, links: [...formData.links, { title: '', url: '' }] });
  };

  const handleRemoveLink = (index) => {
    const newLinks = formData.links.filter((_, i) => i !== index);
    setFormData({ ...formData, links: newLinks });
  };

  const handleTagChange = (index, value) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({ ...formData, tags: newTags });
  };

  const handleAddTag = () => {
    setFormData({ ...formData, tags: [...formData.tags, ''] });
  };

  const handleRemoveTag = (index) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({ ...formData, tags: newTags });
  };

  const openCreateModal = () => {
    setEditingNote(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      description: note.description || '',
      content: note.content || '',
      attachments: note.attachments || [],
      videoUrl: note.videoUrl || '',
      pdfUrl: note.pdfUrl || '',
      links: note.links || [{ title: '', url: '' }],
      tags: note.tags || [''],
      isImportant: note.isImportant || false,
      order: note.order || 0,
    });
    setShowModal(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = (type, format) => {
    if (type === 'image') return '🖼️';
    if (type === 'pdf' || (type === 'raw' && format === 'pdf')) return '📄';
    if (type === 'video') return '🎬';
    return '📎';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(`/admin/books/${chapter?.bookId}/chapters`)}
              className="text-gray-400 hover:text-white transition-colors mb-2 flex items-center gap-1"
            >
              ← Back to Chapters
            </button>
            <h1 className="text-3xl font-bold text-white">Chapter {chapter?.chapterNumber}: {chapter?.title}</h1>
            <p className="text-gray-400">Manage notes for this chapter</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span className="text-xl">+</span> Add Note
          </button>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Notes Yet</h3>
            <p className="text-gray-400">Add notes, upload files, videos, or PDFs to this chapter.</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Note
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note._id} className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-orange-500/50 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                        {note.title}
                      </h3>
                      {note.isImportant && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">⭐ Important</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{note.description}</p>
                    
                    {/* Content */}
                    {note.content && (
                      <div className="mt-2 text-gray-300 text-sm bg-gray-700/50 p-3 rounded-lg">
                        {note.content}
                      </div>
                    )}

                    {/* PDF Display */}
                    {note.pdfUrl && (
                      <div className="mt-3">
                        <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-xl">📄</span>
                              </div>
                              <div>
                                <p className="text-white font-medium">PDF Document</p>
                                <p className="text-gray-400 text-xs truncate max-w-xs">{note.pdfUrl}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={note.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                              >
                                View PDF
                              </a>
                              <a
                                href={note.pdfUrl}
                                download
                                className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm"
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {note.attachments?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {note.attachments.map((att, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                            <span>{getFileIcon(att.type, att.format)}</span>
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-gray-300 hover:text-white"
                            >
                              {att.name || 'File'}
                            </a>
                            {att.size && (
                              <span className="text-xs text-gray-400">({formatFileSize(att.size)})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Video */}
                    {note.videoUrl && (
                      <div className="mt-3">
                        <video src={note.videoUrl} controls className="max-h-48 rounded-lg" />
                      </div>
                    )}

                    {/* Links */}
                    {note.links?.length > 0 && note.links.some(link => link.url) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {note.links.map((link, i) => (
                          link.url && (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm underline"
                            >
                              🔗 {link.title || link.url}
                            </a>
                          )
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    {note.tags?.length > 0 && note.tags.some(tag => tag) && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {note.tags.map((tag, i) => (
                          tag && <span key={i} className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded"># {tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 ml-4">
                    <button
                      onClick={() => openEditModal(note)}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-xs transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingNote ? 'Edit Note' : 'Add New Note'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Note Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Introduction to Variables"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Brief description of this note..."
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Content (Text)</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Write your notes here..."
                />
              </div>

              {/* File Upload - Sends to Backend */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Upload Files (PDFs, Images, Videos)</label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30 cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.avi"
                    disabled={uploadingFiles.length > 0}
                  />
                  {uploadingFiles.length > 0 && (
                    <div className="absolute inset-0 bg-gray-800/80 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="text-sm text-gray-300 mt-2">Processing {uploadingFiles.length} files...</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Upload PDFs, images, videos. PDFs will be automatically set as the main PDF.</p>
              </div>

              {/* Uploaded Attachments Preview */}
              {formData.attachments.length > 0 && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Uploaded Files</label>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {formData.attachments.map((att, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <span>{getFileIcon(att.type)}</span>
                          <span>{att.name}</span>
                          {att.size && (
                            <span className="text-xs text-gray-400">({formatFileSize(att.size)})</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video URL - Can be a URL or uploaded file */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Video URL</label>
                <input
                  type="text"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Paste video URL from YouTube, Vimeo, or upload a video file above"
                />
                <p className="text-xs text-gray-400 mt-1">Enter a video URL or upload a video file above</p>
              </div>

              {/* PDF URL - Auto-filled from upload */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">PDF URL</label>
                <input
                  type="text"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="PDF URL from upload or paste manually"
                  readOnly={formData.attachments.some(a => a.type === 'pdf')}
                />
                <p className="text-xs text-gray-400 mt-1">Automatically filled when you upload a PDF</p>
              </div>

              {/* Links */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Links</label>
                {formData.links.map((link, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Link Title"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="URL"
                    />
                    {formData.links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  + Add Link
                </button>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Tags</label>
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={`Tag ${index + 1}`}
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  + Add Tag
                </button>
              </div>

              {/* Important */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isImportant}
                  onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                />
                <label className="text-gray-300 text-sm">Mark as Important</label>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingFiles.length > 0}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : uploadingFiles.length > 0 ? 'Processing...' : editingNote ? 'Update' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ChapterNotes;