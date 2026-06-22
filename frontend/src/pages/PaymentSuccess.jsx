// pages/PaymentSuccess.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState(null);

  useEffect(() => {
    // Get courseId from URL params or session
    const params = new URLSearchParams(window.location.search);
    const courseIdParam = params.get('courseId');
    if (courseIdParam) {
      setCourseId(courseIdParam);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. You now have access to the course.
        </p>
        <div className="space-y-3">
          {courseId && (
            <Link
              to={`/course/${courseId}/learn`}
              className="block w-full px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Start Learning Now
            </Link>
          )}
          <Link
            to="/my-courses"
            className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Go to My Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;