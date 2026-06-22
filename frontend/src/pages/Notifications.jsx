// pages/Notifications.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
    try {
      await API.put(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(notif => 
        notif._id === notificationId 
          ? { ...notif, isRead: true, readAt: new Date() }
          : notif
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/api/notifications/mark-all-read');
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true, readAt: new Date() })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await API.delete(`/api/notifications/${notificationId}`);
      setNotifications(notifications.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const deleteAll = async () => {
    if (!confirm('Delete all notifications?')) return;
    try {
      await API.delete('/api/notifications/delete-all');
      setNotifications([]);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
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
      course_enrollment: '📚',
      course_completion: '🎉',
      course_published: '📢',
      creator_request_approved: '✅',
      creator_request_rejected: '❌',
      new_lesson: '📝',
      quiz_result: '📊',
      certificate_issued: '🏆',
      payment_success: '💰',
      payment_failed: '❌',
      system: '⚙️',
      admin_message: '📨',
    };
    return icons[type] || '📢';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-600">Stay updated with your latest activities</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              Mark All Read
            </button>
            <button
              onClick={deleteAll}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Delete All
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-green-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 text-3xl">
                      {notification.icon || getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className={`text-base ${!notification.isRead ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="ml-2 flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-400">
                          {timeAgo(notification.createdAt)}
                        </span>
                        <div className="flex space-x-3">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification._id);
                              }}
                              className="text-xs text-green-600 hover:text-green-700 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-center space-x-2">
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPagination({ ...pagination, currentPage: i + 1 })}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pagination.currentPage === i + 1
                        ? 'bg-green-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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