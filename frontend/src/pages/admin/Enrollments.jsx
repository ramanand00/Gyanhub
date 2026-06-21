import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEnrollments();
  }, [page, status]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/admin/enrollments', {
        params: { page, limit: 10, status },
      });
      setEnrollments(res.data.enrollments);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'refunded': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">Enrollments</h1>
          <div className="flex gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment._id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{enrollment.user?.name || 'Unknown'}</p>
                            <p className="text-gray-400 text-sm">{enrollment.user?.email || 'No email'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{enrollment.course?.title || 'Unknown Course'}</p>
                            <p className="text-gray-400 text-sm">{enrollment.course?.category || 'No category'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                                style={{ width: `${enrollment.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-300 text-sm">{enrollment.progress || 0}%</span>
                          </div>
                          {enrollment.completed && (
                            <span className="text-green-400 text-xs">✅ Completed</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {enrollment.amount ? `$${enrollment.amount}` : 'Free'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(enrollment.paymentStatus)}`}>
                            {enrollment.paymentStatus || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          {new Date(enrollment.createdAt).toLocaleDateString()}
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

export default Enrollments;