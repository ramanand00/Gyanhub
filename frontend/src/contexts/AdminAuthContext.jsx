import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await API.get('/api/admin/auth/me');
        setAdmin(res.data.admin);
      } catch (error) {
        localStorage.removeItem('adminToken');
        delete API.defaults.headers.common['Authorization'];
        setAdmin(null);
      }
    }
    setLoading(false);
  };

  const login = (token, adminData) => {
    localStorage.setItem('adminToken', token);
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    delete API.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};