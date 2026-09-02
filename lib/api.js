import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ 
  baseURL: API_BASE_URL, 
  headers: { 'Content-Type': 'application/json' } 
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const loginAdmin = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const getDashboardSummary = async () => (await api.get('/dashboard/summary')).data;
export const getOrders = async (params = {}) => (await api.get('/orders', { params })).data;
export const getOrderById = async (id) => (await api.get(`/orders/${id}`)).data;
export const getCustomers = async (params = {}) => (await api.get('/customers', { params })).data;
export const getCustomerOrders = async (email) => (await api.get(`/customers/${encodeURIComponent(email)}/orders`)).data;
export const getLogs = async (params = {}) => (await api.get('/logs', { params })).data;
export const getLogsSummary = async () => (await api.get('/logs/summary')).data;

export default api;

