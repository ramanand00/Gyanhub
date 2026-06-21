import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/api/admin/dashboard/stats');
      setStats(res.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'from-blue-500 to-blue-600' },
    { label: 'Total Courses', value: stats?.totalCourses || 0, icon: '📚', color: 'from-green-500 to-green-600' },
    { label: 'Total Enrollments', value: stats?.totalEnrollments || 0, icon: '📝', color: 'from-purple-500 to-purple-600' },
    { label: 'Total Revenue', value: `$${stats?.totalRevenue || 0}`, icon: '💰', color: 'from-orange-500 to-red-600' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <span className="text-gray-400 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-r ${stat.color} rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                  <p className="text-white text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-white text-lg font-semibold mb-4">Recent Users</h2>
            <div className="space-y-3">
              {stats?.recentUsers?.map((user) => (
                <div key={user._id} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.isVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {user.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              ))}
              {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                <p className="text-gray-500 text-center py-4">No recent users</p>
              )}
            </div>
          </div>

          {/* Recent Enrollments */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-white text-lg font-semibold mb-4">Recent Enrollments</h2>
            <div className="space-y-3">
              {stats?.recentEnrollments?.map((enrollment) => (
                <div key={enrollment._id} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{enrollment.user?.name || 'Unknown'}</p>
                    <p className="text-gray-400 text-sm truncate">{enrollment.course?.title || 'Unknown Course'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
                    enrollment.paymentStatus === 'completed' ? 'bg-green-500/20 text-green-400' :
                    enrollment.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {enrollment.paymentStatus}
                  </span>
                </div>
              ))}
              {(!stats?.recentEnrollments || stats.recentEnrollments.length === 0) && (
                <p className="text-gray-500 text-center py-4">No recent enrollments</p>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Registrations Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-white text-lg font-semibold mb-4">Monthly Registrations</h2>
          <div className="flex items-end h-48 space-x-2">
            {stats?.monthlyRegistrations?.map((month) => (
              <div key={month._id.month} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-orange-500 to-red-500 rounded-t-lg transition-all duration-300 hover:from-orange-400 hover:to-red-400"
                  style={{
                    height: `${(month.count / Math.max(...stats.monthlyRegistrations.map(m => m.count))) * 100}%`,
                    minHeight: '4px'
                  }}
                ></div>
                <span className="text-gray-400 text-xs mt-2">
                  {new Date(2024, month._id.month - 1).toLocaleString('default', { month: 'short' })}
                </span>
                <span className="text-white text-xs font-medium">{month.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;