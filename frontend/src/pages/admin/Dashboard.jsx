// pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';
import { Link } from 'react-router-dom';
import {
  UsersIcon, 
  BookOpenIcon, 
  AcademicCapIcon, 
  CurrencyRupeeIcon,
  UserGroupIcon,
  ChartBarIcon,
  StarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [period, setPeriod] = useState('month'); // week, month, year

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, requestsRes, activitiesRes, topCoursesRes] = await Promise.all([
        API.get('/api/admin/dashboard/stats', { params: { period } }),
        API.get('/api/admin/admin/creator-requests'),
        API.get('/api/admin/dashboard/activities'),
        API.get('/api/admin/dashboard/top-courses')
      ]);

      setStats(statsRes.data.stats);
      setPendingRequests(requestsRes.data.users || []);
      setRecentActivities(activitiesRes.data.activities || []);
      setTopCourses(topCoursesRes.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  // Stats Cards Configuration
  const statCards = [
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: UsersIcon, 
      color: 'from-blue-500 to-blue-600',
      trend: stats?.userGrowth || 0,
      trendLabel: 'vs last month'
    },
    { 
      label: 'Total Courses', 
      value: stats?.totalCourses || 0, 
      icon: BookOpenIcon, 
      color: 'from-green-500 to-green-600',
      trend: stats?.courseGrowth || 0,
      trendLabel: 'vs last month'
    },
    { 
      label: 'Total Enrollments', 
      value: stats?.totalEnrollments || 0, 
      icon: AcademicCapIcon, 
      color: 'from-purple-500 to-purple-600',
      trend: stats?.enrollmentGrowth || 0,
      trendLabel: 'vs last month'
    },
    { 
      label: 'Total Revenue', 
      value: `Rs. ${stats?.totalRevenue || 0}`, 
      icon: CurrencyRupeeIcon, 
      color: 'from-orange-500 to-red-600',
      trend: stats?.revenueGrowth || 0,
      trendLabel: 'vs last month'
    },
  ];

  // Additional Stats
  const additionalStats = [
    { label: 'Paid Enrollments', value: stats?.paidEnrollments || 0, icon: ShoppingCartIcon, color: 'text-green-400' },
    { label: 'Free Enrollments', value: stats?.freeEnrollments || 0, icon: UserGroupIcon, color: 'text-blue-400' },
    { label: 'Active Users', value: stats?.activeUsers || 0, icon: UsersIcon, color: 'text-purple-400' },
    { label: 'Course Completion Rate', value: `${stats?.completionRate || 0}%`, icon: ChartBarIcon, color: 'text-yellow-400' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {stats?.adminName || 'Admin'}!</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Pending Creator Requests Alert */}
        {pendingRequests.length > 0 && (
          <div className="bg-yellow-900/30 border-2 border-yellow-600 rounded-xl p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-xl">🎓</span>
                </div>
                <div>
                  <h3 className="text-yellow-400 font-semibold">Pending Creator Requests</h3>
                  <p className="text-yellow-300/80 text-sm">
                    {pendingRequests.length} creator{pendingRequests.length > 1 ? 's' : ''} waiting for approval
                  </p>
                </div>
              </div>
              <Link
                to="/admin/creator-requests"
                className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
              >
                View Requests →
              </Link>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
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
                  <div className="flex items-center mt-2">
                    {stat.trend > 0 ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-300 mr-1" />
                    ) : stat.trend < 0 ? (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-300 mr-1" />
                    ) : null}
                    <span className={`text-xs ${stat.trend >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {stat.trend > 0 ? '+' : ''}{stat.trend}% {stat.trendLabel}
                    </span>
                  </div>
                </div>
                <stat.icon className="w-12 h-12 text-white/30" />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {additionalStats.map((stat, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-semibold">Revenue Overview</h2>
              <span className="text-gray-400 text-sm">Last {period}</span>
            </div>
            <div className="h-64 flex items-end space-x-2">
              {stats?.revenueData?.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-300 hover:from-green-400 hover:to-green-300"
                    style={{
                      height: `${(data.value / Math.max(...stats.revenueData.map(d => d.value))) * 100}%`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <span className="text-gray-400 text-xs mt-2">{data.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enrollment Chart */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-semibold">Enrollment Trends</h2>
              <span className="text-gray-400 text-sm">Last {period}</span>
            </div>
            <div className="h-64 flex items-end space-x-2">
              {stats?.enrollmentData?.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-400 hover:to-blue-300"
                    style={{
                      height: `${(data.value / Math.max(...stats.enrollmentData.map(d => d.value))) * 100}%`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <span className="text-gray-400 text-xs mt-2">{data.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities & Top Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-semibold">Recent Activities</h2>
              <Link to="/admin/activities" className="text-orange-400 text-sm hover:text-orange-300">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-700/30 rounded-lg p-3">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{activity.icon || '📌'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{activity.title}</p>
                      <p className="text-gray-400 text-xs">{activity.description}</p>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activities</p>
              )}
            </div>
          </div>

          {/* Top Courses */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-semibold">Top Courses</h2>
              <Link to="/admin/courses" className="text-orange-400 text-sm hover:text-orange-300">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {topCourses.length > 0 ? (
                topCourses.slice(0, 5).map((course, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/50 transition-colors">
                    <span className="text-gray-400 font-bold text-sm w-6">{index + 1}</span>
                    <img
                      src={course.thumbnail || 'https://via.placeholder.com/40x40/059669/ffffff?text=C'}
                      alt={course.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{course.title}</p>
                      <div className="flex items-center space-x-3 text-xs text-gray-400">
                        <span>{course.enrollments || 0} students</span>
                        <span>⭐ {course.rating || 0}</span>
                      </div>
                    </div>
                    <span className="text-green-400 font-semibold text-sm">
                      Rs. {course.price || 0}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No courses available</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-white text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/users"
              className="flex items-center justify-center space-x-2 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <UsersIcon className="w-5 h-5 text-blue-400" />
              <span className="text-white text-sm">Manage Users</span>
            </Link>
            <Link
              to="/admin/courses"
              className="flex items-center justify-center space-x-2 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <BookOpenIcon className="w-5 h-5 text-green-400" />
              <span className="text-white text-sm">Manage Courses</span>
            </Link>
            <Link
              to="/admin/creator-requests"
              className="flex items-center justify-center space-x-2 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <AcademicCapIcon className="w-5 h-5 text-yellow-400" />
              <span className="text-white text-sm">Creator Requests</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;