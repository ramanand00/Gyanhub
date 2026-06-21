import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, [page, search, status]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/admin/courses', {
        params: { page, limit: 10, search, status },
      });
      setCourses(res.data.courses);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await API.delete(`/api/admin/courses/${id}`);
      fetchCourses();
    } catch (error) {
      alert('Failed to delete course');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/api/admin/courses/${id}`, { status: newStatus });
      fetchCourses();
    } catch (error) {
      alert('Failed to update course status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-400';
      case 'draft': return 'bg-yellow-500/20 text-yellow-400';
      case 'archived': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">Courses</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Thumbnail</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Instructor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Students</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {courses.map((course) => (
                      <tr key={course._id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="w-16 h-12 object-cover rounded-lg" />
                          ) : (
                            <div className="w-16 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
                              📚
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-white font-medium">{course.title}</td>
                        <td className="px-6 py-4 text-gray-300">{course.instructor?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-gray-300">
                          {course.price === 0 ? 'Free' : `$${course.price}`}
                          {course.discountPrice && (
                            <span className="text-green-400 text-sm ml-1">-${course.discountPrice}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-300">{course.students?.length || 0}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(course.status)}`}>
                            {course.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <select
                            onChange={(e) => handleStatusChange(course._id, e.target.value)}
                            value={course.status}
                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </select>
                          <button
                            onClick={() => handleDelete(course._id)}
                            className="text-red-400 hover:text-red-300 transition-colors ml-2"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      page === p
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Courses;