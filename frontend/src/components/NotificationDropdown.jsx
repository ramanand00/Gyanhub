// components/NotificationDropdown.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/notifications', {
        params: { limit: 50 }
      });
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get('/api/notifications/unread-count');
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
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
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await API.put('/api/notifications/mark-all-read');
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true, readAt: new Date() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await API.delete(`/api/notifications/${notificationId}`);
      setNotifications(notifications.filter(notif => notif._id !== notificationId));
      if (!notifications.find(n => n._id === notificationId)?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    setIsOpen(false);
    
    if (notification.link) {
      navigate(notification.link);
    }
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

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'border-gray-300',
      medium: 'border-yellow-400',
      high: 'border-red-500',
    };
    return colors[priority] || 'border-gray-300';
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-green-100 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black ring-opacity-5 transform origin-top-right transition-all duration-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-orange-50 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-gray-500">{unreadCount} unread</span>
              )}
            </div>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={markingAll}
                  className="text-xs text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                >
                  {markingAll ? 'Marking...' : 'Mark all read'}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[400px]">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🔔</div>
                <p className="text-gray-500">No notifications yet</p>
                <p className="text-sm text-gray-400">We'll notify you when something happens</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-green-50/50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 text-2xl">
                        {notification.icon || getIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="ml-2 flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {timeAgo(notification.createdAt)}
                          </span>
                          <div className="flex space-x-2">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification._id);
                                }}
                                className="text-xs text-green-600 hover:text-green-700"
                              >
                                Mark read
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
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;