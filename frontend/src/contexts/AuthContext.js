import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Проверяем токен при загрузке приложения
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Проверяем валидность токена
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      // Токен невалиден, удаляем его
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('access_token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData);
      
      toast.success(`Добро пожаловать, ${userData.username}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Ошибка входа';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post('/api/auth/register', {
        username,
        email,
        password,
      });

      toast.success('Регистрация успешна! Теперь войдите в систему.');
      return { success: true, user: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Ошибка регистрации';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Вы вышли из системы');
  };

  const isAuthenticated = () => !!user;
  
  const isAdmin = () => user?.role === 'admin';
  
  const isManager = () => user?.role === 'manager';
  
  const isManagerOrAdmin = () => user?.role === 'manager' || user?.role === 'admin';
  
  const isUser = () => user?.role === 'user';
  
  const isGuest = () => !user;

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
    isAdmin,
    isManager,
    isManagerOrAdmin,
    isUser,
    isGuest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
