// pages/PaymentPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { WalletIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const PaymentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('esewa');
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState('');
  const [courseId, setCourseId] = useState(null);
  const [amount, setAmount] = useState(0);
  const [courseTitle, setCourseTitle] = useState('');

  useEffect(() => {
    const state = location.state || {};
    if (state.courseId) {
      setCourseId(state.courseId);
      setAmount(state.amount || 0);
      setCourseTitle(state.courseTitle || 'Course');
    } else {
      // Try to get from URL params
      const params = new URLSearchParams(location.search);
      const id = params.get('courseId');
      if (id) {
        setCourseId(id);
        setAmount(parseFloat(params.get('amount')) || 0);
        setCourseTitle(params.get('title') || 'Course');
      }
    }
  }, [location]);

  const handleInitiatePayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!courseId) {
      setError('No course selected for payment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await API.post('/api/payment/initiate', {
        courseId: courseId,
        method: method,
      });

      if (response.data.success) {
        setPaymentData(response.data);
        
        if (method === 'esewa') {
          // Redirect to eSewa payment page
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = response.data.esewaUrl;
          
          const paymentData = response.data.paymentData;
          Object.keys(paymentData).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = paymentData[key];
            form.appendChild(input);
          });
          
          document.body.appendChild(form);
          form.submit();
        } else if (method === 'khalti') {
          // Open Khalti payment
          const khaltiWindow = window.open(
            response.data.khaltiUrl,
            '_blank',
            'width=400,height=600'
          );
          
          // Store payment data for verification
          localStorage.setItem('khalti_payment_data', JSON.stringify({
            transactionId: response.data.transactionId,
            enrollmentId: response.data.enrollmentId,
            amount: amount,
            courseId: courseId,
          }));
        }
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  // Handle Khalti payment verification (via callback)
  useEffect(() => {
    const handleKhaltiCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get('status');
      const transactionId = urlParams.get('transactionId');
      
      if (status && transactionId && method === 'khalti') {
        try {
          const response = await API.post('/api/payment/khalti/verify', {
            token: urlParams.get('token'),
            amount: amount,
            transactionId: transactionId,
            status: status,
          });
          
          if (response.data.success) {
            navigate(`/course/${response.data.course._id}/learn`);
          } else {
            navigate('/payment/failure');
          }
        } catch (error) {
          console.error('Khalti verification error:', error);
          navigate('/payment/failure');
        }
      }
    };
    
    handleKhaltiCallback();
  }, [location, method, amount, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to={`/course/${courseId}`} className="text-green-600 hover:text-green-700">
            ← Back to Course
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Payment Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
              <p className="text-gray-600">Pay securely to enroll in this course</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMethod('esewa')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    method === 'esewa'
                      ? 'border-green-600 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <WalletIcon className={`h-5 w-5 ${method === 'esewa' ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${method === 'esewa' ? 'text-green-600' : 'text-gray-700'}`}>
                      eSewa
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setMethod('khalti')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    method === 'khalti'
                      ? 'border-purple-600 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CreditCardIcon className={`h-5 w-5 ${method === 'khalti' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${method === 'khalti' ? 'text-purple-600' : 'text-gray-700'}`}>
                      Khalti
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Payment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Course</span>
                  <span className="font-medium">{courseTitle}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                  <span className="text-gray-800">Total Amount</span>
                  <span className="text-green-600">Rs. {amount}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleInitiatePayment}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                `Pay with ${method === 'esewa' ? 'eSewa' : 'Khalti'}`
              )}
            </button>
          </div>

          {/* Right Sidebar - Course Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h3 className="font-semibold text-gray-800 mb-4">What You'll Get</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Full access to all course materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Video lectures and notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Quizzes and assignments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Certificate upon completion</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">7-day money-back guarantee</span>
                </li>
              </ul>
            </div>

            {/* Test Credentials */}
            <div className="bg-gray-800 rounded-2xl p-6 text-white">
              <h4 className="font-semibold mb-3">Test Credentials</h4>
              <div className="space-y-3 text-sm">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-green-400 font-medium">eSewa</p>
                  <p className="text-gray-300">ID: <span className="font-mono text-green-300">9711111111</span></p>
                  <p className="text-gray-300">Password: <span className="font-mono text-green-300">Nepal@123</span></p>
                  <p className="text-gray-300">OTP: <span className="font-mono text-green-300">123456</span></p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-purple-400 font-medium">Khalti</p>
                  <p className="text-gray-300">ID: <span className="font-mono text-purple-300">9876543210</span></p>
                  <p className="text-gray-300">Password: <span className="font-mono text-purple-300">Khalti@123</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;