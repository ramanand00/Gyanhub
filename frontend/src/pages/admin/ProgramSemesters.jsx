import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';

const ProgramSemesters = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    semesterNumber: '',
    duration: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProgramAndSemesters();
  }, [programId]);

  const fetchProgramAndSemesters = async () => {
    setLoading(true);
    try {
      const [programRes, semestersRes] = await Promise.all([
        API.get(`/api/admin/programs/${programId}`),
        API.get(`/api/admin/programs/${programId}/semesters`),
      ]);
      setProgram(programRes.data.program);
      setSemesters(semestersRes.data.semesters);
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
      if (editingSemester) {
        await API.put(`/api/admin/semesters/${editingSemester._id}`, formData);
      } else {
        await API.post('/api/admin/semesters', { ...formData, programId });
      }
      setShowModal(false);
      setEditingSemester(null);
      setFormData({ title: '', description: '', semesterNumber: '', duration: '' });
      fetchProgramAndSemesters();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save semester');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this semester and all its books, chapters, and notes?')) return;
    try {
      await API.delete(`/api/admin/semesters/${id}`);
      fetchProgramAndSemesters();
    } catch (error) {
      alert('Failed to delete semester');
    }
  };

  const openCreateModal = () => {
    setEditingSemester(null);
    setFormData({ title: '', description: '', semesterNumber: '', duration: '' });
    setShowModal(true);
  };

  const openEditModal = (semester) => {
    setEditingSemester(semester);
    setFormData({
      title: semester.title,
      description: semester.description,
      semesterNumber: semester.semesterNumber,
      duration: semester.duration,
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
              onClick={() => navigate('/admin/programs')}
              className="text-gray-400 hover:text-white transition-colors mb-2 flex items-center gap-1"
            >
              ← Back to Programs
            </button>
            <h1 className="text-3xl font-bold text-white">{program?.title}</h1>
            <p className="text-gray-400">Manage semesters for this program</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span className="text-xl">+</span> Add Semester
          </button>
        </div>

        {/* Semesters List */}
        {semesters.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Semesters Yet</h3>
            <p className="text-gray-400">Add your first semester to this program.</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Semester
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {semesters.map((semester) => (
              <div key={semester._id} className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-orange-500/50 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📚</span>
                      <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                        Semester {semester.semesterNumber}
                      </h3>
                    </div>
                    <h4 className="text-white font-medium mt-1">{semester.title}</h4>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{semester.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="text-gray-400">⏱️ {semester.duration}</span>
                      <span className="text-gray-400">📖 {semester.totalBooks || 0} Books</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    <button
                      onClick={() => navigate(`/admin/semesters/${semester._id}/books`)}
                      className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 text-xs transition-colors"
                      title="Manage Books"
                    >
                      📖
                    </button>
                    <button
                      onClick={() => openEditModal(semester)}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-xs transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(semester._id)}
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
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingSemester ? 'Edit Semester' : 'Add New Semester'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Semester Number *</label>
                <input
                  type="number"
                  value={formData.semesterNumber}
                  onChange={(e) => setFormData({ ...formData, semesterNumber: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="1, 2, 3, ..."
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Semester Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., First Semester, Foundation Year"
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
                  placeholder="Brief description of this semester..."
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Duration *</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 6 Months, 1 Year"
                  required
                />
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
                  {saving ? 'Saving...' : editingSemester ? 'Update' : 'Add Semester'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProgramSemesters;