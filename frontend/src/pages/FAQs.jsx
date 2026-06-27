// pages/FAQs.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/admin/public/content/faq');
      setFaqs(res.data.content || []);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Group FAQs by category
  const groupedFAQs = faqs.reduce((acc, faq) => {
    const category = faq.faqData?.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(faq);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading FAQs</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchFAQs}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/settings" className="text-green-600 hover:text-green-700 flex items-center gap-2">
            <span>←</span> Back to Settings
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Frequently Asked Questions</h1>
          <p className="text-gray-600 mt-2">Find answers to common questions about GyanPark</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {Object.keys(groupedFAQs).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No FAQs available at the moment.</p>
            </div>
          ) : (
            Object.entries(groupedFAQs).map(([category, questions]) => (
              <div key={category} className="mb-8 last:mb-0">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">
                    {category === 'Getting Started' && '🚀'}
                    {category === 'Learning' && '📚'}
                    {category === 'Creator Program' && '🎓'}
                    {category === 'Payments & Subscriptions' && '💰'}
                    {!['Getting Started', 'Learning', 'Creator Program', 'Payments & Subscriptions'].includes(category) && '📌'}
                  </span>
                  {category}
                </h2>
                <div className="space-y-3">
                  {questions.map((faq, qIndex) => {
                    const globalIndex = `${category}-${qIndex}`;
                    return (
                      <div
                        key={faq._id || qIndex}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(globalIndex)}
                          className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium text-gray-800">{faq.title}</span>
                          <span className="text-xl text-gray-500">
                            {openIndex === globalIndex ? '−' : '+'}
                          </span>
                        </button>
                        {openIndex === globalIndex && (
                          <div className="px-4 py-3 bg-white">
                            <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: faq.content }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Still have questions? */}
        <div className="mt-8 bg-green-50 rounded-2xl p-6 text-center border-2 border-green-200">
          <h3 className="text-lg font-semibold text-gray-800">Still have questions?</h3>
          <p className="text-gray-600 mt-1">We're here to help. Contact our support team.</p>
          <Link
            to="/contact"
            className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQs; // ✅ Make sure this line exists