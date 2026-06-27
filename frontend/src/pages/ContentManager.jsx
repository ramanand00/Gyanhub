// pages/admin/ContentManager.jsx - Full version
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';

const ContentManager = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    type: 'faq',
    title: '',
    content: '',
    category: 'general',
    isPublished: true,
    faqData: { category: '', order: 0, isPopular: false },
    policyData: { version: '1.0', lastUpdated: new Date().toISOString().split('T')[0] },
    docData: { sections: [], tags: [], difficulty: 'beginner' },
  });
  const [saving, setSaving] = useState(false);

  const contentTypes = [
    { value: 'faq', label: 'FAQs', icon: '❓' },
    { value: 'documentation', label: 'Documentation', icon: '📖' },
    { value: 'policy', label: 'Policies', icon: '📄' },
    { value: 'announcement', label: 'Announcements', icon: '📢' },
    { value: 'help', label: 'Help Articles', icon: '💡' },
  ];

  useEffect(() => {
    fetchContent();
  }, [selectedType]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/admin/content', {
        params: {
          type: selectedType === 'all' ? undefined : selectedType,
          search: searchTerm || undefined,
        },
      });
      setContent(res.data.content || []);
    } catch (error) {
      console.error('Failed to fetch content:', error);
      alert('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await API.put(`/api/admin/content/${editingItem._id}`, formData);
      } else {
        await API.post('/api/admin/content', formData);
      }
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchContent();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      await API.delete(`/api/admin/content/${id}`);
      fetchContent();
    } catch (error) {
      alert('Failed to delete content');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      title: item.title,
      content: item.content,
      category: item.category || 'general',
      isPublished: item.isPublished,
      faqData: item.faqData || { category: '', order: 0, isPopular: false },
      policyData: item.policyData || { version: '1.0', lastUpdated: new Date().toISOString().split('T')[0] },
      docData: item.docData || { sections: [], tags: [], difficulty: 'beginner' },
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'faq',
      title: '',
      content: '',
      category: 'general',
      isPublished: true,
      faqData: { category: '', order: 0, isPopular: false },
      policyData: { version: '1.0', lastUpdated: new Date().toISOString().split('T')[0] },
      docData: { sections: [], tags: [], difficulty: 'beginner' },
    });
  };

  const getTypeIcon = (type) => {
    const found = contentTypes.find(t => t.value === type);
    return found ? found.icon : '📄';
  };

  const getTypeLabel = (type) => {
    const found = contentTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  const renderFormFields = () => {
    switch (formData.type) {
      case 'faq':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">FAQ Category</label>
                <input
                  type="text"
                  value={formData.faqData?.category || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    faqData: { ...formData.faqData, category: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., Getting Started"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Order</label>
                <input
                  type="number"
                  value={formData.faqData?.order || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    faqData: { ...formData.faqData, order: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.faqData?.isPopular || false}
                onChange={(e) => setFormData({
                  ...formData,
                  faqData: { ...formData.faqData, isPopular: e.target.checked }
                })}
                className="w-4 h-4 text-orange-500 rounded"
              />
              <label className="text-gray-300 text-sm">Mark as Popular FAQ</label>
            </div>
          </>
        );

      case 'policy':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Policy Version</label>
              <input
                type="text"
                value={formData.policyData?.version || '1.0'}
                onChange={(e) => setFormData({
                  ...formData,
                  policyData: { ...formData.policyData, version: e.target.value }
                })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="1.0"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Last Updated</label>
              <input
                type="date"
                value={formData.policyData?.lastUpdated || new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({
                  ...formData,
                  policyData: { ...formData.policyData, lastUpdated: e.target.value }
                })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>
        );

      case 'documentation':
        return (
          <>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Difficulty Level</label>
              <select
                value={formData.docData?.difficulty || 'beginner'}
                onChange={(e) => setFormData({
                  ...formData,
                  docData: { ...formData.docData, difficulty: e.target.value }
                })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.docData?.tags?.join(', ') || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  docData: { ...formData.docData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }
                })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="react, mongodb, nodejs"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Content Manager</h1>
            <p className="text-gray-400">Manage FAQs, Documentation, Policies, Announcements, and Help Articles</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingItem(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-colors shadow-lg hover:shadow-xl"
          >
            + Add New Content
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Types</option>
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchContent()}
              className="flex-1 min-w-[200px] px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={fetchContent}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Updated</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {content.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-2xl mr-2">{getTypeIcon(item.type)}</span>
                        <span className="text-gray-300 text-sm">{getTypeLabel(item.type)}</span>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">{item.title}</td>
                      <td className="px-6 py-4 text-gray-300">{item.category || 'General'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.isPublished
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {item.isPublished ? '✅ Published' : '📝 Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {content.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No content found. Create your first content item!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingItem ? 'Edit Content' : 'Add New Content'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Content Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  {contentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., General, Technical, Support"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="6"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Type-specific fields */}
              {renderFormFields()}

              {/* Publish Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <label className="text-gray-300 text-sm">Publish immediately</label>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ContentManager;