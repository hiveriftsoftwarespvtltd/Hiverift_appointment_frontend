import axios from 'axios';

const API_BASE_URL = 'http://localhost:5005/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token for admin endpoints
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hive_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('hive_admin_token');
      localStorage.removeItem('hive_admin_user');
    }
    return Promise.reject(error);
  },
);

export default api;
