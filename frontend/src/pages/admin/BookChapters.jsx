import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';

const BookChapters = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    chapterNumber: '',
    whatYouWillLearn: [''],
    topics: [''],
    order: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBookAndChapters();
  }, [bookId]);

  const fetchBookAndChapters = async () => {
    setLoading(true);
    try {
      const bookRes = await API.get(`/api/admin/books/${bookId}`);
      setBook(bookRes.data.book);
      const chaptersRes = await API.get(`/api/admin/books/${bookId}/chapters`);
      setChapters(chaptersRes.data.chapters);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingChapter) {
        await API.put(`/api/admin/chapters/${editingChapter._id}`, formData);
      } else {
        await API.post('/api/admin/chapters', { ...formData, bookId });
      }
      setShowModal(false);
      setEditingChapter(null);
      setFormData({ title: '', description: '', chapterNumber: '', whatYouWillLearn: [''], topics: [''], order: 0 });
      fetchBookAndChapters();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save chapter');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this chapter and all its notes?')) return;
    try {
      await API.delete(`/api/admin/chapters/${id}`);
      fetchBookAndChapters();
    } catch (error) {
      alert('Failed to delete chapter');
    }
  };

  const handleArrayItemChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const handleAddArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const handleRemoveArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const openCreateModal = () => {
    setEditingChapter(null);
    setFormData({ title: '', description: '', chapterNumber: '', whatYouWillLearn: [''], topics: [''], order: 0 });
    setShowModal(true);
  };

  const openEditModal = (chapter) => {
    setEditingChapter(chapter);
    setFormData({
      title: chapter.title,
      description: chapter.description || '',
      chapterNumber: chapter.chapterNumber,
      whatYouWillLearn: chapter.whatYouWillLearn || [''],
      topics: chapter.topics || [''],
      order: chapter.order || 0,
    });
    setShowModal(true);
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
              onClick={() => navigate(`/admin/semesters/${book?.semesterId}/books`)}
              className="text-gray-400 hover:text-white transition-colors mb-2 flex items-center gap-1"
            >
              ← Back to Books
            </button>
            <h1 className="text-3xl font-bold text-white">{book?.title}</h1>
            <p className="text-gray-400">Manage chapters for this book</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span className="text-xl">+</span> Add Chapter
          </button>
        </div>

        {/* Chapters List */}
        {chapters.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Chapters Yet</h3>
            <p className="text-gray-400">Add chapters to this book.</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Chapter
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {chapters.map((chapter) => (
              <div key={chapter._id} className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-orange-500/50 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📝</span>
                      <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                        Chapter {chapter.chapterNumber}: {chapter.title}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{chapter.description}</p>
                    
                    {/* What You'll Learn */}
                    {chapter.whatYouWillLearn?.length > 0 && chapter.whatYouWillLearn[0] && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400 font-medium">What You'll Learn:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {chapter.whatYouWillLearn.map((item, i) => (
                            item && <span key={i} className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">✓ {item}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Topics */}
                    {chapter.topics?.length > 0 && chapter.topics[0] && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400 font-medium">Topics:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {chapter.topics.map((topic, i) => (
                            topic && <span key={i} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">• {topic}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mt-3 text-sm text-gray-400">
                      <span>📄 {chapter.totalNotes || 0} Notes</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 ml-4">
                    <button
                      onClick={() => navigate(`/admin/chapters/${chapter._id}/notes`)}
                      className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 text-xs transition-colors"
                      title="Manage Notes"
                    >
                      📄
                    </button>
                    <button
                      onClick={() => openEditModal(chapter)}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-xs transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(chapter._id)}
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
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
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
                  <label className="block text-gray-300 text-sm font-medium mb-1">Chapter Number *</label>
                  <input
                    type="number"
                    value={formData.chapterNumber}
                    onChange={(e) => setFormData({ ...formData, chapterNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="1, 2, 3, ..."
                    min="1"
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
                <label className="block text-gray-300 text-sm font-medium mb-1">Chapter Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Introduction to Programming"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Brief description of this chapter..."
                />
              </div>

              {/* What You'll Learn */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">What You'll Learn</label>
                {formData.whatYouWillLearn.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayItemChange('whatYouWillLearn', index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={`Learning outcome ${index + 1}`}
                    />
                    {formData.whatYouWillLearn.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem('whatYouWillLearn', index)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddArrayItem('whatYouWillLearn')}
                  className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  + Add Learning Outcome
                </button>
              </div>

              {/* Topics */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Topics Covered</label>
                {formData.topics.map((topic, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => handleArrayItemChange('topics', index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={`Topic ${index + 1}`}
                    />
                    {formData.topics.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem('topics', index)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddArrayItem('topics')}
                  className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  + Add Topic
                </button>
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
                  {saving ? 'Saving...' : editingChapter ? 'Update' : 'Add Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default BookChapters;