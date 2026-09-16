import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('swadghar_token');
      const storedUser = localStorage.getItem('swadghar_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend silently
          const response = await api.get('/auth/me');
          if (response?.data) {
            setUser(response.data);
            localStorage.setItem('swadghar_user', JSON.stringify(response.data));
          }
        } catch (error) {
          // Token invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const userData = response.data;
    
    localStorage.setItem('swadghar_token', userData.token);
    localStorage.setItem('swadghar_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const response = await api.post('/auth/register', formData);
    const userData = response.data;

    localStorage.setItem('swadghar_token', userData.token);
    localStorage.setItem('swadghar_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('swadghar_token');
    localStorage.removeItem('swadghar_user');
    setUser(null);
  };

  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('swadghar_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff' || user?.role === 'admin',
        login,
        register,
        logout,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
