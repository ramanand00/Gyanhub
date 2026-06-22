// contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import API, { tokenHelpers } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    
    // Setup auto-refresh every minute
    const refreshInterval = tokenHelpers.setupAutoRefresh(60000);
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const checkAuth = async () => {
    const token = tokenHelpers.getAccessToken();
    if (token && !tokenHelpers.isTokenExpired(token)) {
      try {
        const res = await API.get('/api/auth/me');
        setUser(res.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        // Try to refresh token
        try {
          const refreshToken = tokenHelpers.getRefreshToken();
          if (refreshToken) {
            const refreshRes = await API.post('/api/auth/refresh-token', { refreshToken });
            if (refreshRes.data.success) {
              tokenHelpers.setTokens(
                refreshRes.data.accessToken,
                refreshToken,
                refreshRes.data.user
              );
              setUser(refreshRes.data.user);
              setIsAuthenticated(true);
            }
          }
        } catch (refreshError) {
          tokenHelpers.clearTokens();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } else {
      // Try to refresh token if access token expired but refresh token exists
      const refreshToken = tokenHelpers.getRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await API.post('/api/auth/refresh-token', { refreshToken });
          if (refreshRes.data.success) {
            tokenHelpers.setTokens(
              refreshRes.data.accessToken,
              refreshToken,
              refreshRes.data.user
            );
            setUser(refreshRes.data.user);
            setIsAuthenticated(true);
          }
        } catch (error) {
          tokenHelpers.clearTokens();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        tokenHelpers.clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const login = (accessToken, refreshToken, userData) => {
    tokenHelpers.setTokens(accessToken, refreshToken, userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await API.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    tokenHelpers.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const logoutAllDevices = async () => {
    try {
      await API.post('/api/auth/logout-all');
    } catch (error) {
      console.error('Logout all error:', error);
    }
    tokenHelpers.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshToken = async () => {
    const refreshToken = tokenHelpers.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    try {
      const response = await API.post('/api/auth/refresh-token', { refreshToken });
      if (response.data.success) {
        tokenHelpers.setTokens(
          response.data.accessToken,
          refreshToken,
          response.data.user
        );
        setUser(response.data.user);
        return response.data.accessToken;
      }
      throw new Error('Refresh failed');
    } catch (error) {
      tokenHelpers.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      logoutAllDevices,
      refreshToken,
      checkAuth,
      tokenHelpers,
    }}>
      {children}
    </AuthContext.Provider>
  );
};