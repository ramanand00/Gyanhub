// pages/Notifications.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiArrowLeft, 
  FiBell, 
  FiCheckCircle, 
  FiClock, 
  FiTrash2, 
  FiMail, 
  FiBookOpen,
  FiAward,
  FiDollarSign,
  FiAlertCircle,
  FiUserCheck,
  FiUsers,
  FiMessageCircle,
  FiChevronRight,
  FiFilter,
  FiInbox,
  FiCheck,
  FiXCircle,
  FiEdit,
  FiStar,
  FiSettings,
  FiGift,
  FiHeart,
  FiShare2,
  FiFlag,
  FiCalendar,
  FiGlobe,
  FiTrendingUp,
  FiZap,
  FiThumbsUp,
  FiInfo,
  FiTarget,
  FiAward as FiTrophy
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [pagination.currentPage, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/notifications', {
        params: {
          page: pagination.currentPage,
          limit: 20,
          unreadOnly: filter === 'unread',
        }
      });
      setNotifications(res.data.notifications);
      setPagination({
        currentPage: res.data.pagination.currentPage,
        totalPages: res.data.pagination.totalPages,
        totalItems: res.data.pagination.totalItems,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    setActionLoading(true);
    try {
      await API.put(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(notif => 
        notif._id === notificationId 
          ? { ...notif, isRead: true, readAt: new Date() }
          : notif
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    setActionLoading(true);
    try {
      await API.put('/api/notifications/mark-all-read');
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true, readAt: new Date() })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    setActionLoading(true);
    try {
      await API.delete(`/api/notifications/${notificationId}`);
      setNotifications(notifications.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteAll = async () => {
    if (!confirm('Delete all notifications?')) return;
    if (notifications.length === 0) return;
    setActionLoading(true);
    try {
      await API.delete('/api/notifications/delete-all');
      setNotifications([]);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const timeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  };

  const getIcon = (type) => {
    const icons = {
      course_enrollment: <FiBookOpen className="w-6 h-6 text-blue-500" />,
      course_completion: <FiTrophy className="w-6 h-6 text-yellow-500" />,
      course_published: <FiTrendingUp className="w-6 h-6 text-green-500" />,
      creator_request_approved: <FiUserCheck className="w-6 h-6 text-green-500" />,
      creator_request_rejected: <FiXCircle className="w-6 h-6 text-red-500" />,
      new_lesson: <FiEdit className="w-6 h-6 text-purple-500" />,
      quiz_result: <FiStar className="w-6 h-6 text-yellow-500" />,
      certificate_issued: <FiAward className="w-6 h-6 text-indigo-500" />,
      payment_success: <FiDollarSign className="w-6 h-6 text-green-500" />,
      payment_failed: <FiAlertCircle className="w-6 h-6 text-red-500" />,
      system: <FiSettings className="w-6 h-6 text-gray-500" />,
      admin_message: <FiMessageCircle className="w-6 h-6 text-orange-500" />,
      enrollment: <FiUsers className="w-6 h-6 text-blue-500" />,
      milestone: <FiFlag className="w-6 h-6 text-purple-500" />,
      achievement: <FiGift className="w-6 h-6 text-pink-500" />,
      like: <FiHeart className="w-6 h-6 text-red-500" />,
      share: <FiShare2 className="w-6 h-6 text-green-500" />,
      reminder: <FiClock className="w-6 h-6 text-orange-500" />,
      feedback: <FiThumbsUp className="w-6 h-6 text-blue-500" />,
      announcement: <FiInfo className="w-6 h-6 text-purple-500" />,
      goal: <FiTarget className="w-6 h-6 text-green-500" />,
    };
    return icons[type] || <FiBell className="w-6 h-6 text-gray-400" />;
  };

  const getCategoryColor = (type) => {
    const colors = {
      course_enrollment: 'border-blue-400',
      course_completion: 'border-yellow-400',
      course_published: 'border-green-400',
      creator_request_approved: 'border-green-400',
      creator_request_rejected: 'border-red-400',
      new_lesson: 'border-purple-400',
      quiz_result: 'border-yellow-400',
      certificate_issued: 'border-indigo-400',
      payment_success: 'border-green-400',
      payment_failed: 'border-red-400',
      system: 'border-gray-400',
      admin_message: 'border-orange-400',
      enrollment: 'border-blue-400',
      milestone: 'border-purple-400',
      achievement: 'border-pink-400',
      like: 'border-red-400',
      share: 'border-green-400',
      reminder: 'border-orange-400',
      feedback: 'border-blue-400',
      announcement: 'border-purple-400',
      goal: 'border-green-400',
    };
    return colors[type] || 'border-blue-400';
  };

  const getBgColor = (isRead) => {
    return isRead ? 'bg-white' : 'bg-gradient-to-r from-green-50 to-orange-50/50';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        

        {/* Header with User Avatar - Styled like Contact page */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-l-4 border-orange-500 hover:shadow-2xl transition-shadow duration-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              {user?.name ? (
                <span className="text-white text-xl font-bold">
                  {user.name.charAt(0)}
                </span>
              ) : (
                <FiBell className="text-white text-2xl" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold animate-pulse">
                        {unreadCount} new
                      </span>
                    )}
                  </h1>
                  <p className="text-gray-600">
                    {user ? (
                      <span className="flex items-center gap-2">
                        <span>👋</span> Hello, <span className="text-green-600 font-medium">{user.name}</span>! You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      'Stay updated with your latest activities'
                    )}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={markAllAsRead}
                    disabled={actionLoading || unreadCount === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    Mark All Read
                  </button>
                  <button
                    onClick={deleteAll}
                    disabled={actionLoading || notifications.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters - Styled like Contact page category dropdown */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border-t-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-gray-700">
              <FiFilter className="w-5 h-5 text-green-600" />
              <span className="font-medium text-sm">Filter:</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FiInbox className="w-4 h-4" />
                  All ({pagination.totalItems})
                </span>
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === 'unread'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FiBell className="w-4 h-4" />
                  Unread ({unreadCount})
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-xl p-12 text-center border-l-4 border-green-500">
            <div className="flex justify-center">
              <FaSpinner className="animate-spin h-12 w-12 text-green-500" />
            </div>
            <p className="mt-4 text-gray-600">Loading your notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-xl p-12 text-center border-t-4 border-orange-500">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">You have no notifications at the moment.</p>
            <Link 
              to="/dashboard"
              className="inline-flex items-center gap-2 mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Go to Dashboard
              <FiChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border-l-4 border-green-500 hover:shadow-2xl transition-shadow duration-200">
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer border-l-4 ${getCategoryColor(notification.type)} ${getBgColor(notification.isRead)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                      {notification.icon ? (
                        <span className="text-2xl">{notification.icon}</span>
                      ) : (
                        getIcon(notification.type)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-base ${!notification.isRead ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <span className="ml-2 flex-shrink-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {timeAgo(notification.createdAt)}
                        </span>
                        <div className="flex space-x-3">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification._id);
                              }}
                              disabled={actionLoading}
                              className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium bg-green-50 px-3 py-1 rounded-full hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              <FiCheck className="w-3 h-3" />
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                            disabled={actionLoading}
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <FiTrash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination - Styled like Contact page sidebar buttons */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-orange-50/30 border-t border-gray-200 flex justify-center space-x-2">
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-green-50 hover:border-green-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Previous
                </button>
                {[...Array(Math.min(pagination.totalPages, 7))].map((_, i) => {
                  let pageNum = i + 1;
                  // Show pages around current
                  if (pagination.totalPages > 7) {
                    if (pagination.currentPage > 4 && i < 3) {
                      pageNum = pagination.currentPage - 2 + i;
                    } else if (pagination.currentPage > 4 && i === 3) {
                      return <span key="ellipsis" className="px-3 py-2 text-gray-400">...</span>;
                    } else if (pagination.currentPage > 4 && i > 3) {
                      pageNum = pagination.currentPage - 2 + i;
                    }
                  }
                  if (pageNum > pagination.totalPages) return null;
                  return (
                    <button
                      key={i}
                      onClick={() => setPagination({ ...pagination, currentPage: pageNum })}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        pagination.currentPage === pageNum
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-400'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-green-50 hover:border-green-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;