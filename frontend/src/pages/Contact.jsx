// pages/Contact.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import { 
  FiArrowLeft, 
  FiSend, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiClock, 
  FiBook, 
  FiMessageCircle, 
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiList,
  FiTool,
  FiCreditCard,
  FiBookOpen,
  FiStar,
  FiHelpCircle,
  FiChevronRight
} from 'react-icons/fi';
import { 
  FaUserCircle,
  FaSpinner 
} from 'react-icons/fa';
import { 
  MdCategory,
  MdOutlineSubject 
} from 'react-icons/md';

const Contact = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill user data when logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Send contact form to backend
      await API.post('/api/contact', formData);
      setSuccess(true);
      setFormData(prev => ({
        ...prev,
        subject: '',
        message: '',
        category: 'general'
      }));
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Back Button - Styled like Home page cards */}
        <div className="mb-8">
          <Link 
            to="/settings" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors duration-200 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg border-l-4 border-green-500"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Settings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form - Main Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-xl p-8 border-l-4 border-orange-500 hover:shadow-2xl transition-shadow duration-200">
              {/* Header with User Avatar */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {user?.name ? (
                    <span className="text-white text-xl font-bold">
                      {user.name.charAt(0)}
                    </span>
                  ) : (
                    <FaUserCircle className="text-white text-2xl" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Contact Support
                  </h1>
                  <p className="text-gray-600">
                    {user ? (
                      <span className="flex items-center gap-2">
                        <span>👋</span> Hello, <span className="text-green-600 font-medium">{user.name}</span>! We'll get back to you within 24 hours.
                      </span>
                    ) : (
                      'We\'ll get back to you within 24 hours'
                    )}
                  </p>
                </div>
              </div>

              {/* Success/Error Messages - Styled like Home page verification badge */}
              {success && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center space-x-2">
                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-700 font-medium">Message sent successfully! We'll get back to you soon.</p>
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

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">
                      Your Name {!user && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ${
                        user 
                          ? 'border-gray-300 bg-gray-50 cursor-not-allowed text-gray-600' 
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                      placeholder={user ? 'Auto-filled from your account' : 'Enter your name'}
                      required={!user}
                      disabled={!!user}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">
                      Email Address {!user && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ${
                        user 
                          ? 'border-gray-300 bg-gray-50 cursor-not-allowed text-gray-600' 
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                      placeholder={user ? 'Auto-filled from your account' : 'Enter your email'}
                      required={!user}
                      disabled={!!user}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 hover:border-green-400 appearance-none bg-white"
                    required
                  >
                    <option value="general">📋 General Inquiry</option>
                    <option value="technical">🔧 Technical Issue</option>
                    <option value="payment">💳 Payment Problem</option>
                    <option value="course">📚 Course Related</option>
                    <option value="creator">🎨 Creator Program</option>
                    <option value="feedback">💡 Feedback</option>
                    <option value="other">❓ Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 hover:border-green-400"
                    placeholder="Brief subject of your message"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows="5"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 hover:border-green-400 resize-none"
                    placeholder="Describe your issue or question in detail..."
                    required
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Info Cards styled like Home page stats */}
          <div className="space-y-6">
            {/* Contact Information Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiPhone className="text-2xl text-green-600" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <FiMail className="text-2xl text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="text-sm text-gray-700 font-medium">mail@riseuptech.com.np</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <FiPhone className="text-2xl text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</p>
                    <p className="text-sm text-gray-700 font-medium">+977-9827399860</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <FiMapPin className="text-2xl text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</p>
                    <p className="text-sm text-gray-700 font-medium">Kathmandu, Nepal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-orange-500 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FiClock className="text-orange-600" />
                  Response Time
                </h3>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-green-600">Online</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">We typically respond within 24 hours during business days.</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <FiClock className="w-4 h-4 text-green-500" />
                <span>Mon-Fri, 9:00 AM - 6:00 PM NPT</span>
              </div>
            </div>

            {/* Quick Help Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiHelpCircle className="text-2xl text-green-600" />
                Quick Help
              </h3>
              <div className="space-y-2.5">
                <Link 
                  to="/faqs" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors duration-200 group"
                >
                  <FiBook className="text-xl text-green-600" />
                  <span className="text-sm text-gray-700 group-hover:text-green-600 font-medium transition-colors">View FAQs</span>
                  <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 ml-auto transition-colors" />
                </Link>
                <Link 
                  to="/documentation" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors duration-200 group"
                >
                  <FiBookOpen className="text-xl text-orange-600" />
                  <span className="text-sm text-gray-700 group-hover:text-orange-600 font-medium transition-colors">Read Documentation</span>
                  <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 ml-auto transition-colors" />
                </Link>
                <Link 
                  to="/community" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors duration-200 group"
                >
                  <FiUsers className="text-xl text-green-600" />
                  <span className="text-sm text-gray-700 group-hover:text-green-600 font-medium transition-colors">Join Community</span>
                  <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 ml-auto transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;