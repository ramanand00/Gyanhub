import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';

const ChapterNotes = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
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
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => {
          resolve({
            type: file.type.startsWith('image/') ? 'image' :
                  file.type === 'application/pdf' ? 'pdf' :
                  file.type.startsWith('video/') ? 'video' : 'file',
            url: reader.result,
            name: file.name,
            size: file.size,
            mimeType: file.type,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newAttachments).then((attachments) => {
      setFormData({ ...formData, attachments: [...formData.attachments, ...attachments] });
    });
  };

  const handleRemoveAttachment = (index) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: newAttachments });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUploadProgress(0);
    try {
      if (editingNote) {
        await API.put(`/api/admin/notes/${editingNote._id}`, formData);
      } else {
        await API.post('/api/admin/notes', { ...formData, chapterId });
      }
      setShowModal(false);
      setEditingNote(null);
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
      fetchChapterAndNotes();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save note');
    } finally {
      setSaving(false);
      setUploadProgress(100);
    }
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

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'pdf': return '📄';
      case 'video': return '🎬';
      default: return '📎';
    }
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

                    {/* Attachments */}
                    {note.attachments?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {note.attachments.map((att, i) => (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm text-gray-300"
                          >
                            {getFileIcon(att.type)} {att.name} ({formatFileSize(att.size)})
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Video */}
                    {note.videoUrl && (
                      <div className="mt-3">
                        <video src={note.videoUrl} controls className="max-h-48 rounded-lg" />
                      </div>
                    )}

                    {/* PDF */}
                    {note.pdfUrl && (
                      <div className="mt-3">
                        <a
                          href={note.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          📄 View PDF
                        </a>
                      </div>
                    )}

                    {/* Links */}
                    {note.links?.length > 0 && note.links[0]?.url && (
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
                    {note.tags?.length > 0 && note.tags[0] && (
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

              {/* File Upload */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Upload Files (Images, PDFs, Videos, etc.)</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30"
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}
                {formData.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.attachments.map((att, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-lg">
                        <span>{getFileIcon(att.type)}</span>
                        <span className="text-sm text-gray-300">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Video URL</label>
                <input
                  type="text"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Upload video or enter URL..."
                />
                <p className="text-xs text-gray-400 mt-1">Upload video files or paste a video URL</p>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">PDF URL</label>
                <input
                  type="text"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Upload PDF or enter URL..."
                />
                <p className="text-xs text-gray-400 mt-1">Upload PDF files or paste a PDF URL</p>
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
                        ×
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
                        ×
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
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingNote ? 'Update' : 'Add Note'}
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