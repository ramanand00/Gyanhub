// pages/Privacy.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { 
  FiArrowLeft, 
  FiLock, 
  FiCalendar, 
  FiCheckCircle, 
  FiAlertCircle,
  FiRefreshCw,
  FiShield,
  FiGlobe,
  FiUsers,
  FiMail,
  FiInfo,
  FiChevronRight,
  FiEye,
  FiDatabase,
  FiServer,
  FiUserCheck,
  FiFileText,
  FiClock
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';

const Privacy = () => {
  const [privacy, setPrivacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/admin/public/content/policy');
      
      // Find the privacy policy content
      const privacyContent = res.data.content.find(
        item => item.slug === 'privacy-policy' || 
                item.title.toLowerCase().includes('privacy')
      );
      
      setPrivacy(privacyContent || null);
    } catch (error) {
      console.error('Failed to fetch privacy policy:', error);
      setError('Failed to load privacy policy');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-xl p-12 text-center border-l-4 border-green-500">
            <div className="flex justify-center">
              <FaSpinner className="animate-spin h-12 w-12 text-green-500" />
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading privacy policy...</p>
            <p className="text-sm text-gray-400 mt-1">Please wait while we fetch the latest version</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-xl p-12 text-center border-l-4 border-red-500">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Privacy Policy</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchPrivacyPolicy}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FiRefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border-l-4 border-blue-500 hover:shadow-2xl transition-shadow duration-200">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 md:p-8 border-b border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <FiLock className="text-white text-2xl" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {privacy?.title || 'Privacy Policy'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <FiCalendar className="w-4 h-4 text-blue-500" />
                    <span>Last Updated:</span>
                    <span className="font-medium text-gray-700">
                      {privacy?.policyData?.lastUpdated 
                        ? new Date(privacy.policyData.lastUpdated).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'January 2024'}
                    </span>
                  </div>
                  {privacy?.policyData?.version && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <FiInfo className="w-4 h-4 text-blue-500" />
                      <span>Version:</span>
                      <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {privacy.policyData.version}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-green-600">
                    <FiCheckCircle className="w-4 h-4" />
                    <span className="font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8">
            {privacy ? (
              <>
                {/* Key Privacy Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <FiEye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700">Data Collection</p>
                    <p className="text-xs text-gray-500">Transparent</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <FiShield className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700">Data Protection</p>
                    <p className="text-xs text-gray-500">Secure</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <FiUserCheck className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700">Your Rights</p>
                    <p className="text-xs text-gray-500">Controlled</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg text-center">
                    <FiDatabase className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700">Data Storage</p>
                    <p className="text-xs text-gray-500">Secure</p>
                  </div>
                </div>

                {/* Table of Contents - Quick Navigation */}
                <div className="mb-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FiFileText className="w-4 h-4 text-blue-500" />
                    Quick Navigation
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer">
                      Information We Collect
                    </span>
                    <span className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer">
                      How We Use Data
                    </span>
                    <span className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer">
                      Data Sharing
                    </span>
                    <span className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer">
                      Your Rights
                    </span>
                    <span className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer">
                      Data Security
                    </span>
                    <span className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer">
                      Contact Us
                    </span>
                  </div>
                </div>

                {/* Privacy Policy Content */}
                <div 
                  className="prose prose-blue max-w-none prose-headings:text-gray-800 prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-strong:text-gray-800 prose-a:text-blue-600 hover:prose-a:text-blue-700"
                  dangerouslySetInnerHTML={{ __html: privacy.content }}
                />

                {/* Key Privacy Principles */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <FiShield className="w-5 h-5 text-blue-500" />
                      <h4 className="font-semibold text-gray-800">Data Protection</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      We implement industry-standard security measures to protect your personal information.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center gap-2 mb-2">
                      <FiUserCheck className="w-5 h-5 text-green-500" />
                      <h4 className="font-semibold text-gray-800">Your Rights</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      You have the right to access, modify, or delete your personal data at any time.
                    </p>
                  </div>
                </div>

                {/* Related Policies */}
                <div className="mt-10 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <FiGlobe className="w-4 h-4 text-blue-500" />
                    Related Policies
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      to="/terms"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group"
                    >
                      <span className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-blue-600">
                        <FiFileText className="w-4 h-4 text-blue-500" />
                        Terms of Service
                      </span>
                      <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                    <Link
                      to="/cookies"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group"
                    >
                      <span className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-blue-600">
                        <FiGlobe className="w-4 h-4 text-blue-500" />
                        Cookies Policy
                      </span>
                      <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </div>
                </div>

                {/* Trust Section */}
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start gap-3">
                    <FiShield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">Your Privacy Matters to Us</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        We are committed to protecting your privacy and handling your data with transparency and care.
                      </p>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FiCheckCircle className="w-3 h-3 text-green-500" />
                          GDPR Compliant
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FiCheckCircle className="w-3 h-3 text-green-500" />
                          Data Protection
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FiCheckCircle className="w-3 h-3 text-green-500" />
                          Privacy First
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Privacy Policy Available</h3>
                <p className="text-gray-500">Privacy policy content is not available at the moment.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Please contact the administrator to add a privacy policy.
                </p>
                <button
                  onClick={fetchPrivacyPolicy}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <FiClock className="w-3 h-3" />
            This document was last reviewed on{' '}
            {privacy?.policyData?.lastUpdated 
              ? new Date(privacy.policyData.lastUpdated).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'January 2024'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;