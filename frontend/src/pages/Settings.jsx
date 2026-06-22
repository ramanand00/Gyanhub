// pages/Settings.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';

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
      // Update user context
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
      // You can create a feedback endpoint or use email
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
    { id: 'account', label: 'Account Information', icon: '👤' },
    { id: 'password', label: 'Password & Security', icon: '🔒' },
    { id: 'feedback', label: 'Give Feedback', icon: '💬' },
    { id: 'help', label: 'Help & Support', icon: '❓' },
    { id: 'legal', label: 'Legal & Policies', icon: '📜' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600">Manage your account preferences</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="md:w-64 bg-gray-50 border-r border-gray-200">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                        activeSection === section.id
                          ? 'bg-green-100 text-green-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                      }`}
                    >
                      <span className="text-xl">{section.icon}</span>
                      <span className="text-sm">{section.label}</span>
                    </button>
                  ))}
                  
                  {/* Logout Button in Sidebar */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 mt-4 border-t border-gray-200 pt-4"
                  >
                    <span className="text-xl">🚪</span>
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {message && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg">
                  {message}
                </div>
              )}
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Account Information */}
              {activeSection === 'account' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Account Information</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        disabled
                      />
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.mobileNumber}
                        onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Updating...' : 'Update Account Information'}
                    </button>
                  </form>
                </div>
              )}

              {/* Password & Security */}
              {activeSection === 'password' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Password & Security</h2>
                  <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                        placeholder="Enter current password"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                        placeholder="Enter new password"
                        required
                        minLength="6"
                      />
                      <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}

              {/* Give Feedback */}
              {activeSection === 'feedback' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Give Feedback</h2>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Feedback Type
                      </label>
                      <select
                        value={feedbackData.type}
                        onChange={(e) => setFeedbackData({ ...feedbackData, type: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                      >
                        <option value="suggestion">Suggestion</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={feedbackData.subject}
                        onChange={(e) => setFeedbackData({ ...feedbackData, subject: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                        placeholder="Brief subject"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Message
                      </label>
                      <textarea
                        value={feedbackData.message}
                        onChange={(e) => setFeedbackData({ ...feedbackData, message: e.target.value })}
                        rows="5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                        placeholder="Describe your feedback in detail"
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                </div>
              )}

              {/* Help & Support */}
              {activeSection === 'help' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Help & Support</h2>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <span className="text-2xl mr-3">📚</span>
                        Frequently Asked Questions
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Find answers to common questions about using GyanPark
                      </p>
                      <button className="mt-2 text-green-600 hover:text-green-700 font-medium text-sm">
                        View FAQs →
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <span className="text-2xl mr-3">📧</span>
                        Contact Support
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Get help from our support team
                      </p>
                      <button className="mt-2 text-green-600 hover:text-green-700 font-medium text-sm">
                        Contact Us →
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <span className="text-2xl mr-3">📖</span>
                        Documentation
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Read our detailed documentation and guides
                      </p>
                      <button className="mt-2 text-green-600 hover:text-green-700 font-medium text-sm">
                        View Documentation →
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <span className="text-2xl mr-3">💬</span>
                        Community Forum
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Join our community discussions
                      </p>
                      <button className="mt-2 text-green-600 hover:text-green-700 font-medium text-sm">
                        Visit Forum →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Legal & Policies */}
              {activeSection === 'legal' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Legal & Policies</h2>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <span className="text-2xl mr-3">📄</span>
                        Terms of Service
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Read our terms and conditions
                      </p>
                      <button className="mt-2 text-green-600 hover:text-green-700 font-medium text-sm">
                        View Terms →
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <span className="text-2xl mr-3">🔒</span>
                        Privacy Policy
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Learn how we handle your data
                      </p>
                      <button className="mt-2 text-green-600 hover:text-green-700 font-medium text-sm">
                        View Privacy Policy →
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <span className="text-2xl mr-3">🍪</span>
                        Cookies Policy
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Understand how we use cookies
                      </p>
                      <button className="mt-2 text-green-600 hover:text-green-700 font-medium text-sm">
                        View Cookies Policy →
                      </button>
                    </div>
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