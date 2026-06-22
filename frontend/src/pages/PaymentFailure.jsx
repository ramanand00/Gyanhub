// pages/PaymentFailure.jsx
import { Link } from 'react-router-dom';

const PaymentFailure = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-6">
          There was an issue processing your payment. Please try again or contact support.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="block w-full px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
          <Link
            to="/courses"
            className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;