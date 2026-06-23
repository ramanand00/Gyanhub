// pages/PaymentFailure.jsx
import { Link } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/outline';

const PaymentFailure = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-4">
          <XCircleIcon className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-6">
          There was an issue processing your payment. Please try again or use a different payment method.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="block w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-colors"
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