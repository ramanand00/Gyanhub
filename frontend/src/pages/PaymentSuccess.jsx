// pages/PaymentSuccess.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import API from '../services/api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState(null);

  useEffect(() => {
    // Get payment status from URL params
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const transactionId = params.get('transactionId');
    const refId = params.get('refId');
    
    console.log('Payment Success - Status:', status);
    console.log('Payment Success - Transaction ID:', transactionId);
    console.log('Payment Success - Reference ID:', refId);

    // Check if we have course info from state
    if (location.state?.courseId) {
      setCourseId(location.state.courseId);
    }

    // Verify payment and get enrollment details
    const verifyPayment = async () => {
      try {
        // If we have a transaction ID from eSewa/Khalti callback
        if (transactionId) {
          const response = await API.get(`/api/payment/status/${transactionId}`);
          if (response.data.success) {
            setEnrollment(response.data.enrollment);
            setCourseId(response.data.enrollment.course);
          }
        } else if (location.state?.result) {
          // From our internal payment flow
          const { result } = location.state;
          if (result.enrollmentId) {
            const response = await API.get(`/api/payment/status/${result.transaction_uuid}`);
            if (response.data.success) {
              setEnrollment(response.data.enrollment);
              setCourseId(response.data.enrollment.course);
            }
          }
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();

    // Auto redirect after 10 seconds if no interaction
    const timer = setTimeout(() => {
      navigate('/my-learning');
    }, 10000);

    return () => clearTimeout(timer);
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
          <CheckCircleIcon className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful! 🎉</h2>
        <p className="text-gray-600 mb-4">
          Your payment was processed successfully. You now have access to the course.
        </p>
        
        {enrollment && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
            <p className="text-sm text-gray-500">Transaction ID: <span className="font-mono text-gray-700">{enrollment.transactionId}</span></p>
            <p className="text-sm text-gray-500">Amount: <span className="font-semibold text-green-600">Rs. {enrollment.amount}</span></p>
            <p className="text-sm text-gray-500">Status: <span className="font-semibold text-green-600">Completed</span></p>
          </div>
        )}

        <div className="space-y-3">
          {courseId ? (
            <Link
              to={`/course/${courseId}/learn`}
              className="block w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors flex items-center justify-center gap-2"
            >
              Start Learning Now
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              to="/my-learning"
              className="block w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors"
            >
              Go to My Learning
            </Link>
          )}
          
          <Link
            to="/courses"
            className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Browse More Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;