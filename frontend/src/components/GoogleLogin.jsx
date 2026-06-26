// components/GoogleLogin.jsx
import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      console.log('📤 Sending Google token to backend...');
      
      const res = await API.post('/api/auth/google', {
        token: credentialResponse.credential,
      });

      console.log('✅ Google login response:', res.data);

      if (res.data.success) {
        // Store token and user data
        login(res.data.token, res.data.refreshToken, res.data.user);
        navigate('/home');
      } else {
        setError(res.data.error || 'Failed to login with Google');
      }
    } catch (error) {
      console.error('❌ Google login error:', error);
      setError(error.response?.data?.error || 'Failed to login with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3 w-full">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg w-full text-sm">
          {error}
        </div>
      )}
      
      <div className="relative w-full flex justify-center">
        {loading && (
          <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        )}
        
        <div className="w-full max-w-xs">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              setError('Google login failed. Please try again.');
              setLoading(false);
            }}
            useOneTap
            theme="filled_blue"
            size="large"
            text="signin_with"
            shape="rectangular"
            logo_alignment="center"
          />
        </div>
      </div>

      <div className="flex items-center w-full my-4">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-sm text-gray-500">OR</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        By continuing with Google, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};

export default GoogleLoginButton;