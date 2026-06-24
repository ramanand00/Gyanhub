import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';

const SemesterBooks = () => {
  const { semesterId } = useParams();
  const navigate = useNavigate();
  const [semester, setSemester] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    bookCover: '',
    authors: [''],
  });
  const [coverPreview, setCoverPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSemesterAndBooks();
  }, [semesterId]);

  const fetchSemesterAndBooks = async () => {
    setLoading(true);
    try {
      // Fetch semester
      const semesterRes = await API.get(`/api/admin/semesters/${semesterId}`);
      setSemester(semesterRes.data.semester);
      
      // Fetch books for this semester
      const booksRes = await API.get(`/api/admin/semesters/${semesterId}/books`);
      setBooks(booksRes.data.books);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // If semester fetch fails, try to get semester from books endpoint
      try {
        const booksRes = await API.get(`/api/admin/semesters/${semesterId}/books`);
        setBooks(booksRes.data.books);
        // Set a placeholder semester name
        setSemester({ title: 'Semester', semesterNumber: '?' });
      } catch (err) {
        console.error('Failed to fetch books:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
        setFormData({ ...formData, bookCover: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBook) {
        await API.put(`/api/admin/books/${editingBook._id}`, formData);
      } else {
        await API.post('/api/admin/books', { ...formData, semesterId });
      }
      setShowModal(false);
      setEditingBook(null);
      setFormData({ title: '', bookCover: '', authors: [''] });
      setCoverPreview('');
      fetchSemesterAndBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save book');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this book and all its chapters and notes?')) return;
    try {
      await API.delete(`/api/admin/books/${id}`);
      fetchSemesterAndBooks();
    } catch (error) {
      alert('Failed to delete book');
    }
  };

  const handleAddAuthor = () => {
    setFormData({ ...formData, authors: [...formData.authors, ''] });
  };

  const handleAuthorChange = (index, value) => {
    const newAuthors = [...formData.authors];
    newAuthors[index] = value;
    setFormData({ ...formData, authors: newAuthors });
  };

  const handleRemoveAuthor = (index) => {
    if (formData.authors.length <= 1) return;
    const newAuthors = formData.authors.filter((_, i) => i !== index);
    setFormData({ ...formData, authors: newAuthors });
  };

  const openCreateModal = () => {
    setEditingBook(null);
    setFormData({ title: '', bookCover: '', authors: [''] });
    setCoverPreview('');
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      bookCover: book.bookCover || '',
      authors: book.authors || [''],
    });
    setCoverPreview(book.bookCover || '');
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
              onClick={() => navigate(`/admin/programs/${semester?.programId}/semesters`)}
              className="text-gray-400 hover:text-white transition-colors mb-2 flex items-center gap-1"
            >
              ← Back to Semesters
            </button>
            <h1 className="text-3xl font-bold text-white">
              {semester ? `Semester ${semester.semesterNumber}: ${semester.title}` : 'Books'}
            </h1>
            <p className="text-gray-400">Manage books for this semester</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span className="text-xl">+</span> Add Book
          </button>
        </div>

        {/* Books Grid */}
        {books.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Books Yet</h3>
            <p className="text-gray-400">Add books to this semester.</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Book
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book._id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-orange-500/50 transition-all group">
                {/* Book Cover */}
                <div className="h-48 bg-gray-700 relative">
                  {book.bookCover ? (
                    <img 
                      src={book.bookCover} 
                      alt={book.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-gray-500">
                      📖
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span>📝 {book.totalChapters || 0} Chapters</span>
                    </div>
                  </div>
                </div>
                
                {/* Book Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors truncate">
                    {book.title}
                  </h3>
                  
                  {/* Authors */}
                  {book.authors && book.authors.length > 0 && book.authors[0] && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {book.authors.map((author, i) => (
                        author && (
                          <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                            ✍️ {author}
                          </span>
                        )
                      ))}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-700">
                    <button
                      onClick={() => navigate(`/admin/books/${book._id}/chapters`)}
                      className="flex-1 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 text-sm transition-colors"
                    >
                      📝 Chapters
                    </button>
                    <button
                      onClick={() => openEditModal(book)}
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(book._id)}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm transition-colors"
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
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Book Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Introduction to Computer Science"
                  required
                />
              </div>

              {/* Book Cover */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Book Cover</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="flex-1 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30"
                  />
                  {coverPreview && (
                    <div className="relative w-16 h-20 flex-shrink-0">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover rounded-lg border border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverPreview('');
                          setFormData({ ...formData, bookCover: '' });
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Recommended: 400x600 pixels</p>
              </div>

              {/* Authors */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Authors</label>
                {formData.authors.map((author, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => handleAuthorChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={`Author ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAuthor(index)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        formData.authors.length <= 1
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      }`}
                      disabled={formData.authors.length <= 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddAuthor}
                  className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  + Add Author
                </button>
              </div>

              {/* Buttons */}
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
                  {saving ? 'Saving...' : editingBook ? 'Update' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SemesterBooks;