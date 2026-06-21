import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const Admins = () => {
  const { admin: currentAdmin } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    permissions: {
      manageUsers: true,
      manageCourses: true,
      manageAdmins: false,
      viewAnalytics: true,
    },
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/admin/admins');
      setAdmins(res.data.admins);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/admin/admins', formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        permissions: {
          manageUsers: true,
          manageCourses: true,
          manageAdmins: false,
          viewAnalytics: true,
        },
      });
      fetchAdmins();
    } catch (error) {
      alert('Failed to create admin: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    try {
      await API.delete(`/api/admin/admins/${id}`);
      fetchAdmins();
    } catch (error) {
      alert('Failed to delete admin');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-500/20 text-purple-400';
      case 'admin': return 'bg-blue-500/20 text-blue-400';
      case 'moderator': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">Admin Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-colors shadow-lg hover:shadow-xl"
          >
            + Add Admin
          </button>
        </div>

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {admins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {admin.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-white font-medium">{admin.name}</span>
                          {admin._id === currentAdmin?._id && (
                            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">You</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{admin.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(admin.role)}`}>
                          {admin.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          admin.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {admin.role !== 'super_admin' && admin._id !== currentAdmin?._id && (
                          <button
                            onClick={() => handleDelete(admin._id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        )}
                        {admin._id === currentAdmin?._id && (
                          <span className="text-gray-500 text-sm">Cannot modify self</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Add New Admin</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Permissions</label>
                <div className="space-y-2 bg-gray-700/30 p-3 rounded-lg">
                  <label className="flex items-center space-x-3 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.permissions.manageUsers}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, manageUsers: e.target.checked }
                      })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span>Manage Users</span>
                  </label>
                  <label className="flex items-center space-x-3 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.permissions.manageCourses}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, manageCourses: e.target.checked }
                      })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span>Manage Courses</span>
                  </label>
                  <label className="flex items-center space-x-3 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.permissions.manageAdmins}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, manageAdmins: e.target.checked }
                      })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span>Manage Admins</span>
                  </label>
                  <label className="flex items-center space-x-3 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.permissions.viewAnalytics}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, viewAnalytics: e.target.checked }
                      })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span>View Analytics</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Admins;