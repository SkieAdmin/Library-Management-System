import axios from 'axios';

const API_BASE_URL = 'http://localhost/Library-Management-System/backend/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login.php', credentials),
  logout: () => api.post('/auth/logout.php'),
  me: () => api.get('/auth/me.php'),
};

// Books API
export const booksAPI = {
  getAll: (params = {}) => api.get('/books/index.php', { params }),
  getById: (id) => api.get(`/books/${id}.php`),
  create: (data) => api.post('/books/index.php', data),
  update: (id, data) => api.put(`/books/${id}.php`, data),
  delete: (id) => api.delete(`/books/${id}.php`),
};

// Students API
export const studentsAPI = {
  getAll: (params = {}) => api.get('/students/index.php', { params }),
  create: (data) => api.post('/students/index.php', data),
};

// Records API
export const recordsAPI = {
  getAll: (params = {}) => api.get('/records/index.php', { params }),
  borrow: (data) => api.post('/records/index.php', data),
  return: (data) => api.post('/records/return.php', data),
};

export default api;
