// pages/Settings.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import CreatorRequest from '../components/CreatorRequest';
import { 
  FiArrowLeft, 
  FiUser, 
  FiLock, 
  FiAward, 
  FiMessageCircle, 
  FiHelpCircle, 
  FiFileText, 
  FiLogOut,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiAlertCircle,
  FiSave,
  FiKey,
  FiSend,
  FiBook,
  FiUsers,
  FiShield,
  FiGlobe,
  FiChevronRight,
  FiInfo,
  FiSettings as FiSettingsIcon,
  FiStar,
  FiBookOpen,
  FiLifeBuoy,
  FiClipboard,
  FiEdit2
} from 'react-icons/fi';
import { FaSpinner, FaUserCircle } from 'react-icons/fa';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Account Information Form
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    mobileNumber: user?.mobileNumber || '',
  });

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Feedback Form
  const [feedbackData, setFeedbackData] = useState({
    type: 'suggestion',
    subject: '',
    message: '',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await API.put('/api/settings/update-profile', profileData);
      setMessage(res.data.message);
      const token = localStorage.getItem('token');
      const userData = res.data.user;
      localStorage.setItem('user', JSON.stringify(userData));
      window.location.reload();
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await API.put('/api/settings/update-password', passwordData);
      setMessage(res.data.message);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update password');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Thank you for your feedback! We appreciate it.');
      setFeedbackData({
        type: 'suggestion',
        subject: '',
        message: '',
      });
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setError('Failed to submit feedback. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const sections = [
    { id: 'account', label: 'Account Information', icon: FiUser, color: 'text-blue-500' },
    { id: 'password', label: 'Password & Security', icon: FiLock, color: 'text-orange-500' },
    { id: 'creator', label: 'Creator Status', icon: FiAward, color: 'text-purple-500' },
    { id: 'feedback', label: 'Give Feedback', icon: FiMessageCircle, color: 'text-pink-500' },
    { id: 'help', label: 'Help & Support', icon: FiHelpCircle, color: 'text-green-500' },
    { id: 'legal', label: 'Legal & Policies', icon: FiFileText, color: 'text-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
       

        {/* Header with User Avatar - Styled like Contact page */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-l-4 border-orange-500 hover:shadow-2xl transition-shadow duration-200">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              {user?.name ? (
                <span className="text-white text-xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <FaUserCircle className="text-white text-2xl" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    Settings
                    <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {user?.role || 'Student'}
                    </span>
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <span>👋</span> Manage your account preferences and settings
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Navigation Cards */}
          <div className="lg:col-span-1 space-y-2">
            <div className="bg-white rounded-xl shadow-md p-4 border-t-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                Navigation
              </p>
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-green-50 to-orange-50 border-l-4 border-green-500 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? section.color : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>
                      {section.label}
                    </span>
                    {isActive && <FiChevronRight className="w-4 h-4 text-green-500 ml-auto" />}
                  </button>
                );
              })}
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-xl shadow-md p-4 border-t-4 border-orange-500 hover:shadow-lg transition-shadow duration-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-xs text-gray-600">Member Since</span>
                  <span className="text-xs font-semibold text-green-700">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <span className="text-xs text-gray-600">Account Status</span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
                    <FiCheckCircle className="w-3 h-3" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-green-500 hover:shadow-2xl transition-shadow duration-200">
              {/* Success/Error Messages - Styled like Contact page */}
              {message && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center space-x-2">
                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-700 font-medium">{message}</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center space-x-2">
                    <FiAlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Account Information */}
              {activeSection === 'account' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <FiUser className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Account Information</h2>
                      <p className="text-sm text-gray-500">Update your personal details</p>
                    </div>
                  </div>
                  <form onSubmit={handleProfileUpdate} className="space-y-5">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1.5">
                        <FiUser className="inline w-4 h-4 mr-1.5 text-green-500" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 hover:border-green-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1.5">
                        <FiMail className="inline w-4 h-4 mr-1.5 text-green-500" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-600"
                        disabled
                      />
                      <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                        <FiInfo className="w-3 h-3" />
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1.5">
                        <FiPhone className="inline w-4 h-4 mr-1.5 text-green-500" />
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.mobileNumber || ''}
                        onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 hover:border-green-400"
                        placeholder={user?.googleId ? 'Not provided (Google user)' : 'Enter mobile number'}
                      />
                      {user?.googleId && (
                        <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                          <FiInfo className="w-3 h-3" />
                          You can add a mobile number for notifications
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <FiSave className="w-5 h-5 mr-2" />
                          Update Account Information
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Password & Security */}
              {activeSection === 'password' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <FiLock className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Password & Security</h2>
                      <p className="text-sm text-gray-500">Manage your account security</p>
                    </div>
                  </div>
                  
                  {user?.googleId ? (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-8 text-center">
                      <div className="text-5xl mb-4">🔐</div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Google Account</h3>
                      <p className="text-gray-600 mb-4 max-w-md mx-auto">
                        You are using Google authentication. You don't need a password to log in.
                      </p>
                      <div className="bg-white rounded-lg p-4 inline-block shadow-sm">
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <FiCheckCircle className="w-4 h-4 text-green-500" />
                          Secure authentication via Google
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-4">
                        To manage your password, please use your Google Account settings.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordUpdate} className="space-y-5">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1.5">
                          <FiKey className="inline w-4 h-4 mr-1.5 text-orange-500" />
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 hover:border-orange-400"
                          placeholder="Enter current password"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1.5">
                          <FiLock className="inline w-4 h-4 mr-1.5 text-orange-500" />
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 hover:border-orange-400"
                          placeholder="Enter new password"
                          required
                          minLength="6"
                        />
                        <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                          <FiInfo className="w-3 h-3" />
                          Must be at least 6 characters
                        </p>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1.5">
                          <FiCheckCircle className="inline w-4 h-4 mr-1.5 text-orange-500" />
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 hover:border-orange-400"
                          placeholder="Confirm new password"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                            Updating Password...
                          </>
                        ) : (
                          <>
                            <FiSave className="w-5 h-5 mr-2" />
                            Update Password
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Creator Status */}
              {activeSection === 'creator' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FiAward className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Creator Status</h2>
                      <p className="text-sm text-gray-500">Manage your creator profile</p>
                    </div>
                  </div>
                  <CreatorRequest />
                </div>
              )}

              {/* Give Feedback */}
              {activeSection === 'feedback' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <FiMessageCircle className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Give Feedback</h2>
                      <p className="text-sm text-gray-500">Help us improve your experience</p>
                    </div>
                  </div>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1.5">
                        <FiClipboard className="inline w-4 h-4 mr-1.5 text-pink-500" />
                        Feedback Type
                      </label>
                      <select
                        value={feedbackData.type}
                        onChange={(e) => setFeedbackData({ ...feedbackData, type: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 hover:border-pink-400 appearance-none bg-white"
                      >
                        <option value="suggestion">💡 Suggestion</option>
                        <option value="bug">🐛 Bug Report</option>
                        <option value="feature">🚀 Feature Request</option>
                        <option value="other">❓ Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1.5">
                        <FiEdit2 className="inline w-4 h-4 mr-1.5 text-pink-500" />
                        Subject
                      </label>
                      <input
                        type="text"
                        value={feedbackData.subject}
                        onChange={(e) => setFeedbackData({ ...feedbackData, subject: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 hover:border-pink-400"
                        placeholder="Brief subject"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1.5">
                        <FiMessageCircle className="inline w-4 h-4 mr-1.5 text-pink-500" />
                        Message
                      </label>
                      <textarea
                        value={feedbackData.message}
                        onChange={(e) => setFeedbackData({ ...feedbackData, message: e.target.value })}
                        rows="5"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 hover:border-pink-400 resize-none"
                        placeholder="Describe your feedback in detail..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FiSend className="w-5 h-5 mr-2" />
                          Submit Feedback
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Help & Support */}
              {activeSection === 'help' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <FiHelpCircle className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Help & Support</h2>
                      <p className="text-sm text-gray-500">Resources to help you succeed</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                      to="/faqs"
                      className="group bg-gradient-to-r from-gray-50 to-green-50/30 rounded-xl p-5 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-green-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiBook className="text-white text-xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                            Frequently Asked Questions
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Find answers to common questions
                          </p>
                          <span className="inline-flex items-center gap-1 mt-2 text-green-600 group-hover:text-green-700 font-medium text-sm">
                            View FAQs
                            <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/contact"
                      className="group bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-xl p-5 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-orange-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiLifeBuoy className="text-white text-xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                            Contact Support
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Get help from our support team
                          </p>
                          <span className="inline-flex items-center gap-1 mt-2 text-orange-600 group-hover:text-orange-700 font-medium text-sm">
                            Contact Us
                            <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/documentation"
                      className="group bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-xl p-5 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-purple-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiBookOpen className="text-white text-xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                            Documentation
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Read detailed guides and tutorials
                          </p>
                          <span className="inline-flex items-center gap-1 mt-2 text-purple-600 group-hover:text-purple-700 font-medium text-sm">
                            View Documentation
                            <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/community"
                      className="group bg-gradient-to-r from-gray-50 to-pink-50/30 rounded-xl p-5 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-pink-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiUsers className="text-white text-xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                            Community Forum
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Join discussions with other learners
                          </p>
                          <span className="inline-flex items-center gap-1 mt-2 text-pink-600 group-hover:text-pink-700 font-medium text-sm">
                            Visit Forum
                            <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}

              {/* Legal & Policies */}
              {activeSection === 'legal' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                      <FiFileText className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Legal & Policies</h2>
                      <p className="text-sm text-gray-500">Important legal information</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Link
                      to="/terms"
                      className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-green-200"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiFileText className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                          Terms of Service
                        </h3>
                        <p className="text-sm text-gray-600">Read our terms and conditions</p>
                      </div>
                      <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                    </Link>

                    <Link
                      to="/privacy"
                      className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-green-200"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiShield className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                          Privacy Policy
                        </h3>
                        <p className="text-sm text-gray-600">Learn how we handle your data</p>
                      </div>
                      <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                    </Link>

                    <Link
                      to="/cookies"
                      className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-green-200"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiGlobe className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                          Cookies Policy
                        </h3>
                        <p className="text-sm text-gray-600">Understand how we use cookies</p>
                      </div>
                      <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;