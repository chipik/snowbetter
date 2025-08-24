import axios from 'axios';

// Создаем базовую конфигурацию axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000,
});

// Добавляем токен к каждому запросу
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем interceptors для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если токен недействителен, удаляем его
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      // Перенаправляем на страницу входа, если это не гостевой запрос
      if (window.location.pathname !== '/' && window.location.pathname !== '/tricks') {
        window.location.href = '/login';
      }
    }
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
