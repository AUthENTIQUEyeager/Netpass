import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
});

// Injecter le token JWT automatiquement
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('wp_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Rediriger vers login si 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/admin') && path !== '/admin/login') {
        localStorage.removeItem('wp_token');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default API;

export const getForfaits = () => API.get('/api/forfaits').then(r => r.data);
export const getSites    = () => API.get('/api/sites').then(r => r.data);
