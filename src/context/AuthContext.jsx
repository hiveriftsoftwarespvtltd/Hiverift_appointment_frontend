import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('hive_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hive_admin_token');
    if (token) {
      api
        .get('/admin/auth/me')
        .then((res) => {
          setAdmin(res.data);
          localStorage.setItem('hive_admin_user', JSON.stringify(res.data));
        })
        .catch(() => {
          setAdmin(null);
          localStorage.removeItem('hive_admin_token');
          localStorage.removeItem('hive_admin_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/admin/auth/login', { email, password });
    if (res.data.accessToken) {
      localStorage.setItem('hive_admin_token', res.data.accessToken);
      localStorage.setItem('hive_admin_user', JSON.stringify(res.data.admin));
      setAdmin(res.data.admin);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('hive_admin_token');
    localStorage.removeItem('hive_admin_user');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
