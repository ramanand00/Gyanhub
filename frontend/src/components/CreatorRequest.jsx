// components/CreatorRequest.jsx
import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CreatorRequest = () => {
  const { user, login } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [requestData, setRequestData] = useState({
    expertise: '',
    experience: '',
    reason: '',
    portfolio: '',
  });

  useEffect(() => {
    checkCreatorStatus();
  }, []);

  const checkCreatorStatus = async () => {
    try {
      const res = await API.get('/api/user/creator-status');
      setStatus(res.data);
      
      // If there's a rejected request, pre-fill the form with previous data
      if (res.data.creatorRequest?.status === 'rejected' && res.data.creatorRequest) {
        setRequestData({
          expertise: res.data.creatorRequest.expertise || '',
          experience: res.data.creatorRequest.experience || '',
          reason: res.data.creatorRequest.reason || '',
          portfolio: res.data.creatorRequest.portfolio || '',
        });
      }
    } catch (error) {
      console.error('Error checking creator status:', error);
    }
  };

  // components/CreatorRequest.jsx - Update the handleRequestCreator function
const handleRequestCreator = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setMessage('');

  console.log('📤 Submitting creator request with data:', requestData);

  try {
    const res = await API.post('/api/user/request-creator', requestData);
    console.log('✅ Request submitted successfully:', res.data);
    setMessage(res.data.message);
    checkCreatorStatus();
    setShowForm(false);
    // Refresh user data
    const userRes = await API.get('/api/user/profile');
    login(localStorage.getItem('token'), userRes.data.user);
  } catch (error) {
    console.error('❌ Failed to submit request:', error);
    setError(error.response?.data?.message || 'Failed to submit request');
  } finally {
    setLoading(false);
  }
};

  // If already a creator
  if (status?.isCreator) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-800">🎓 Creator Account Active</h3>
            <p className="text-green-700">You have full access to create and publish courses.</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span className="text-green-600">📚 {status.totalCourses || 0} Courses</span>
              <span className="text-green-600">👥 {status.totalStudents || 0} Students</span>
              <span className="text-green-600">⭐ {status.creatorRating || 0} Rating</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If request is pending
  if (status?.creatorRequest?.status === 'pending') {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white animate-spin" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-800">⏳ Request Under Review</h3>
            <p className="text-yellow-700">Your creator request is being reviewed by the admin team.</p>
            <p className="text-sm text-yellow-600 mt-2">
              Requested on: {new Date(status.creatorRequest.requestedAt).toLocaleDateString()}
            </p>
            <div className="mt-3 bg-yellow-100 rounded-lg p-3">
              <p className="text-xs text-yellow-700">
                💡 You'll receive a notification once your request is reviewed.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If request was rejected - Show form with edit option
  if (status?.creatorRequest?.status === 'rejected') {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800">Request Rejected</h3>
              {status.creatorRequest.notes && (
                <p className="text-red-700 mt-1">Reason: {status.creatorRequest.notes}</p>
              )}
              <button
                onClick={() => {
                  setShowForm(true);
                  // Pre-fill form with previous data if available
                  if (status.creatorRequest) {
                    setRequestData({
                      expertise: status.creatorRequest.expertise || '',
                      experience: status.creatorRequest.experience || '',
                      reason: status.creatorRequest.reason || '',
                      portfolio: status.creatorRequest.portfolio || '',
                    });
                  }
                }}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Submit New Request
              </button>
            </div>
          </div>
        </div>

        {/* Show form if user clicks "Submit New Request" */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <form onSubmit={handleRequestCreator} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">New Creator Request</h3>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-sm text-gray-600">Please update your information and submit again.</p>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Your Expertise *</label>
                <input
                  type="text"
                  value={requestData.expertise}
                  onChange={(e) => setRequestData({ ...requestData, expertise: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Web Development, Data Science, Design"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Years of Experience *</label>
                <input
                  type="text"
                  value={requestData.experience}
                  onChange={(e) => setRequestData({ ...requestData, experience: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 5 years, 3+ years"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Why do you want to create courses? *</label>
                <textarea
                  value={requestData.reason}
                  onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Tell us about your motivation and what you hope to achieve..."
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Portfolio / Sample Work (Optional)</label>
                <input
                  type="url"
                  value={requestData.portfolio}
                  onChange={(e) => setRequestData({ ...requestData, portfolio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="https://your-portfolio.com"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit New Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {message && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg">
                  {message}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    );
  }

  // No request yet - Show initial request form
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {!showForm ? (
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Become a Creator</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Share your knowledge with thousands of learners. Create and publish your own courses.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl mb-2">📚</div>
              <h4 className="font-semibold text-gray-800">Create Courses</h4>
              <p className="text-sm text-gray-600">Build and structure your courses with modules and lessons</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-semibold text-gray-800">Earn Revenue</h4>
              <p className="text-sm text-gray-600">Set your own prices and earn from your courses</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl mb-2">🌍</div>
              <h4 className="font-semibold text-gray-800">Global Reach</h4>
              <p className="text-sm text-gray-600">Reach students from all around the world</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-colors shadow-lg hover:shadow-xl"
          >
            Request Creator Status
          </button>
        </div>
      ) : (
        <form onSubmit={handleRequestCreator} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Request Creator Status</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <p className="text-gray-600 text-sm">Tell us about yourself and why you want to become a creator.</p>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Your Expertise *</label>
            <input
              type="text"
              value={requestData.expertise}
              onChange={(e) => setRequestData({ ...requestData, expertise: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Web Development, Data Science, Design"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Years of Experience *</label>
            <input
              type="text"
              value={requestData.experience}
              onChange={(e) => setRequestData({ ...requestData, experience: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., 5 years, 3+ years"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Why do you want to create courses? *</label>
            <textarea
              value={requestData.reason}
              onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Tell us about your motivation and what you hope to achieve..."
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Portfolio / Sample Work (Optional)</label>
            <input
              type="url"
              value={requestData.portfolio}
              onChange={(e) => setRequestData({ ...requestData, portfolio: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://your-portfolio.com"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>

          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default CreatorRequest;