// pages/Settings.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import CreatorRequest from '../components/CreatorRequest';
import CVPreviewModal from '../components/CVPreviewModal';
import logo from '../assets/logo.png';
import { 
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
  FiEdit2,
  FiEye,
  FiChevronDown,
  FiChevronUp,
  FiLifeBuoy,
  FiClipboard,
  FiStar,
  FiBookOpen,
  FiArrowLeft,
  FiSettings,
  FiShield as FiShieldIcon
} from 'react-icons/fi';
import { FaSpinner, FaUserCircle, FaGraduationCap, FaCode, FaHeart, FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedSection, setExpandedSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showCVPreview, setShowCVPreview] = useState(false);

  // Account Information Form
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    mobileNumber: user?.mobileNumber || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || '',
    address: user?.address || {
      street: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
    },
    socialLinks: user?.socialLinks || {
      linkedin: '',
      github: '',
      twitter: '',
      instagram: '',
      facebook: '',
      youtube: '',
      website: '',
    },
    education: user?.education || [],
    skills: user?.skills || [],
    interests: user?.interests || [],
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

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name || name === '') {
      return 'U';
    }
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

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
    {
      id: 'account',
      label: 'Account Information',
      icon: FiUser,
      color: 'text-blue-500',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-500',
      description: 'Update your personal details and profile information'
    },
    {
      id: 'password',
      label: 'Password & Security',
      icon: FiLock,
      color: 'text-orange-500',
      bgColor: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-500',
      description: 'Manage your account security and password'
    },
    {
      id: 'creator',
      label: 'Creator Status',
      icon: FiAward,
      color: 'text-purple-500',
      bgColor: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-500',
      description: 'Apply for creator status and manage your creator profile'
    },
    {
      id: 'feedback',
      label: 'Give Feedback',
      icon: FiMessageCircle,
      color: 'text-pink-500',
      bgColor: 'from-pink-50 to-pink-100',
      borderColor: 'border-pink-500',
      description: 'Help us improve by sharing your thoughts and suggestions'
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: FiHelpCircle,
      color: 'text-green-500',
      bgColor: 'from-green-50 to-green-100',
      borderColor: 'border-green-500',
      description: 'Get help, view FAQs, and contact support'
    },
    {
      id: 'legal',
      label: 'Legal & Policies',
      icon: FiFileText,
      color: 'text-gray-500',
      bgColor: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-500',
      description: 'View our terms of service, privacy policy, and cookies policy'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* CV Preview Modal */}
      <CVPreviewModal 
        isOpen={showCVPreview}
        onClose={() => setShowCVPreview(false)}
        profileData={{
          name: profileData.name || user?.name || '',
          mobileNumber: profileData.mobileNumber || user?.mobileNumber || '',
          bio: profileData.bio || user?.bio || '',
          profilePicture: profileData.profilePicture || user?.profilePicture || '',
          address: profileData.address || user?.address || {
            street: '',
            city: '',
            state: '',
            country: '',
            pincode: '',
          },
          socialLinks: profileData.socialLinks || user?.socialLinks || {
            linkedin: '',
            github: '',
            twitter: '',
            instagram: '',
            facebook: '',
            youtube: '',
            website: '',
          },
          education: profileData.education || user?.education || [],
          skills: profileData.skills || user?.skills || [],
          interests: profileData.interests || user?.interests || [],
        }}
        user={user}
        formatDate={formatDate}
        getInitials={getInitials}
        platformName="GyanPark"
        logo={logo}
      />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white">
                  {user?.name ? (
                    <span className="text-white text-lg font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <FaUserCircle className="text-white text-2xl" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Settings</h1>
                  <p className="text-white/80 text-sm">Manage your account preferences</p>
                </div>
              </div>
              <button
                onClick={() => setShowCVPreview(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 text-sm font-medium backdrop-blur-sm"
              >
                <FiEye className="w-4 h-4" />
                View CV
              </button>
            </div>
          </div>

          {/* User Info Bar */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                <FiMail className="inline mr-1.5" />
                {user?.email}
              </span>
              <span className="text-sm text-gray-600">
                <FiCheckCircle className="inline mr-1.5 text-green-500" />
                Active
              </span>
            </div>
            <Link to="/profile" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
              <FiUser className="w-4 h-4" />
              View Profile
              <FiChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-orange-50 rounded-xl border-l-4 border-green-500">
            <div className="flex items-center space-x-2">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-700 font-medium">{message}</p>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-xl border-l-4 border-red-500">
            <div className="flex items-center space-x-2">
              <FiAlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Settings Sections - Accordion Style */}
        <div className="space-y-3">
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.id;
            
            return (
              <div key={section.id} className="bg-white rounded-2xl shadow-md overflow-hidden border-l-4 hover:shadow-xl transition-all duration-200" style={{ borderLeftColor: isExpanded ? '#22c55e' : '#e5e7eb' }}>
                {/* Section Header - Clickable to toggle */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 bg-gradient-to-br ${section.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${section.color}`} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800">{section.label}</h3>
                      <p className="text-sm text-gray-500 hidden sm:block">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* <span className="text-xs text-gray-400">
                      {isExpanded ? 'Click to collapse' : 'Click to expand'}
                    </span> */}
                    {isExpanded ? (
                      <FiChevronUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <FiChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Section Content - Expanded */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                    {/* Account Information */}
                    {section.id === 'account' && (
                      <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1.5">
                              <FiUser className="inline w-4 h-4 mr-1.5 text-green-500" />
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={profileData.name}
                              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                              required
                            />
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
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                              placeholder="Enter mobile number"
                            />
                          </div>
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
                            <FiEdit2 className="inline w-4 h-4 mr-1.5 text-green-500" />
                            Bio
                          </label>
                          <textarea
                            value={profileData.bio || ''}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 resize-none"
                            placeholder="Tell us about yourself..."
                          />
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
                    )}

                    {/* Password & Security */}
                    {section.id === 'password' && (
                      <div>
                        {user?.googleId ? (
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                            <div className="text-4xl mb-3">🔐</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Google Account</h3>
                            <p className="text-gray-600 mb-3 max-w-md mx-auto text-sm">
                              You are using Google authentication. You don't need a password to log in.
                            </p>
                            <div className="bg-white rounded-lg p-3 inline-block shadow-sm">
                              <p className="text-sm text-gray-500 flex items-center gap-2">
                                <FiCheckCircle className="w-4 h-4 text-green-500" />
                                Secure authentication via Google
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                              To manage your password, please use your Google Account settings.
                            </p>
                          </div>
                        ) : (
                          <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div>
                              <label className="block text-gray-700 text-sm font-medium mb-1.5">
                                <FiKey className="inline w-4 h-4 mr-1.5 text-orange-500" />
                                Current Password
                              </label>
                              <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                                placeholder="Enter current password"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                                  <FiLock className="inline w-4 h-4 mr-1.5 text-orange-500" />
                                  New Password
                                </label>
                                <input
                                  type="password"
                                  value={passwordData.newPassword}
                                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                                  placeholder="Enter new password"
                                  required
                                  minLength="6"
                                />
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
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                                  placeholder="Confirm new password"
                                  required
                                />
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <FiInfo className="w-3 h-3" />
                              Password must be at least 6 characters
                            </p>

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
                    {section.id === 'creator' && (
                      <CreatorRequest />
                    )}

                    {/* Give Feedback */}
                    {section.id === 'feedback' && (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1.5">
                            <FiClipboard className="inline w-4 h-4 mr-1.5 text-pink-500" />
                            Feedback Type
                          </label>
                          <select
                            value={feedbackData.type}
                            onChange={(e) => setFeedbackData({ ...feedbackData, type: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 appearance-none bg-white"
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
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200"
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
                            rows="4"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 resize-none"
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
                    )}

                    {/* Help & Support */}
                    {section.id === 'help' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Link
                          to="/faqs"
                          className="group bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-4 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiBook className="text-white text-lg" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors text-sm">
                                FAQs
                              </h4>
                              <p className="text-xs text-gray-600 mt-0.5">
                                Find answers to common questions
                              </p>
                            </div>
                          </div>
                        </Link>

                        <Link
                          to="/contact"
                          className="group bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-xl p-4 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-orange-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiLifeBuoy className="text-white text-lg" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors text-sm">
                                Contact Support
                              </h4>
                              <p className="text-xs text-gray-600 mt-0.5">
                                Get help from our team
                              </p>
                            </div>
                          </div>
                        </Link>

                        <Link
                          to="/documentation"
                          className="group bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-xl p-4 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-purple-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiBookOpen className="text-white text-lg" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors text-sm">
                                Documentation
                              </h4>
                              <p className="text-xs text-gray-600 mt-0.5">
                                Read guides and tutorials
                              </p>
                            </div>
                          </div>
                        </Link>

                        <Link
                          to="/community"
                          className="group bg-gradient-to-r from-gray-50 to-pink-50/30 rounded-xl p-4 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-pink-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiUsers className="text-white text-lg" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors text-sm">
                                Community Forum
                              </h4>
                              <p className="text-xs text-gray-600 mt-0.5">
                                Join discussions with learners
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    )}

                    {/* Legal & Policies */}
                    {section.id === 'legal' && (
                      <div className="space-y-2">
                        <Link
                          to="/terms"
                          className="group flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-green-200"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiFileText className="text-white text-sm" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 group-hover:text-green-600 transition-colors text-sm">
                              Terms of Service
                            </h4>
                            <p className="text-xs text-gray-500">Read our terms and conditions</p>
                          </div>
                          <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link
                          to="/privacy"
                          className="group flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-green-200"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiShield className="text-white text-sm" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 group-hover:text-green-600 transition-colors text-sm">
                              Privacy Policy
                            </h4>
                            <p className="text-xs text-gray-500">Learn how we handle your data</p>
                          </div>
                          <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link
                          to="/cookies"
                          className="group flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-green-200"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiGlobe className="text-white text-sm" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 group-hover:text-green-600 transition-colors text-sm">
                              Cookies Policy
                            </h4>
                            <p className="text-xs text-gray-500">Understand how we use cookies</p>
                          </div>
                          <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Logout Button at Bottom */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
          <p className="text-center text-xs text-gray-500 mt-2">
            By logging out, you will be redirected to the login page
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} GyanPark. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;