// pages/Terms.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { 
  FiArrowLeft, 
  FiFileText, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle,
  FiRefreshCw,
  FiCalendar,
  FiBookOpen,
  FiShield,
  FiGlobe,
  FiUsers,
  FiLock,
  FiCreditCard,
  FiMail,
  FiInfo,
  FiChevronRight
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';

const Terms = () => {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/admin/public/content/policy');
      
      // Find the terms of service
      const termsContent = res.data.content.find(
        item => item.slug === 'terms-of-service' || 
                item.title.toLowerCase().includes('terms')
      );
      
      setTerms(termsContent || null);
    } catch (error) {
      console.error('Failed to fetch terms:', error);
      setError('Failed to load terms of service');
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
            <p className="mt-4 text-gray-600 font-medium">Loading terms of service...</p>
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
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Terms</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchTerms}
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
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border-l-4 border-orange-500 hover:shadow-2xl transition-shadow duration-200">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-50 to-orange-50 p-6 md:p-8 border-b border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <FiFileText className="text-white text-2xl" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {terms?.title || 'Terms of Service'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <FiCalendar className="w-4 h-4 text-green-500" />
                    <span>Last Updated:</span>
                    <span className="font-medium text-gray-700">
                      {terms?.policyData?.lastUpdated 
                        ? new Date(terms.policyData.lastUpdated).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'January 2024'}
                    </span>
                  </div>
                  {terms?.policyData?.version && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <FiInfo className="w-4 h-4 text-green-500" />
                      <span>Version:</span>
                      <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {terms.policyData.version}
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
            {terms ? (
              <>
                {/* Table of Contents - Quick Navigation */}
                <div className="mb-8 p-4 bg-gradient-to-r from-gray-50 to-green-50/30 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FiBookOpen className="w-4 h-4 text-green-500" />
                    Quick Navigation
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors cursor-pointer">
                      Overview
                    </span>
                    <span className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors cursor-pointer">
                      User Obligations
                    </span>
                    <span className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors cursor-pointer">
                      Intellectual Property
                    </span>
                    <span className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors cursor-pointer">
                      Privacy
                    </span>
                    <span className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors cursor-pointer">
                      Liability
                    </span>
                    <span className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors cursor-pointer">
                      Termination
                    </span>
                  </div>
                </div>

                {/* Terms Content */}
                <div 
                  className="prose prose-green max-w-none prose-headings:text-gray-800 prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-strong:text-gray-800 prose-a:text-green-600 hover:prose-a:text-green-700"
                  dangerouslySetInnerHTML={{ __html: terms.content }}
                />

                {/* Quick Links Section */}
                <div className="mt-10 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <FiShield className="w-4 h-4 text-green-500" />
                    Related Policies
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      to="/privacy"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors group"
                    >
                      <span className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-green-600">
                        <FiLock className="w-4 h-4 text-green-500" />
                        Privacy Policy
                      </span>
                      <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                    <Link
                      to="/cookies"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors group"
                    >
                      <span className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-green-600">
                        <FiGlobe className="w-4 h-4 text-green-500" />
                        Cookies Policy
                      </span>
                      <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </div>
                </div>

                {/* Acceptance Section */}
                <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">By using GyanPark, you agree to these terms</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        If you do not agree with any part of these terms, please discontinue using our services.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Terms Available</h3>
                <p className="text-gray-500">Terms of service are not available at the moment.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Please contact the administrator to add terms of service.
                </p>
                <button
                  onClick={fetchTerms}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
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
            {terms?.policyData?.lastUpdated 
              ? new Date(terms.policyData.lastUpdated).toLocaleDateString('en-US', {
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

export default Terms;