import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authAPI from '../api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kiểm tra authentication khi app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (authAPI.isAuthenticated()) {
        const response = await authAPI.getProfile();
        if (response.success) {
          setUser(response.user);
        }
      }
    } catch (err) {
      console.error('Check auth error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        return { success: true, user: response.user };
      }
      
      throw new Error(response.message || 'Đăng nhập thất bại');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      
      if (response.success) {
        setUser(response.user);
        return { success: true, user: response.user };
      }
      
      throw new Error(response.message || 'Đăng ký thất bại');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Vẫn clear user state dù có lỗi
      setUser(null);
    }
  };

  const updateUserProfile = async (updateData) => {
    try {
      setError(null);
      const response = await authAPI.updateProfile(updateData);
      
      if (response.success) {
        setUser(response.user);
        return { success: true, user: response.user };
      }
      
      throw new Error(response.message || 'Cập nhật thất bại');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const isAdmin = () => {
    return user?.role === 'Admin';
  };

  const isWorker = () => {
    return user?.role === 'Worker';
  };

  const canAccessDevice = (deviceId) => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    return user.devices?.includes(deviceId) || false;
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUserProfile,
    isAuthenticated: !!user,
    isAdmin,
    isWorker,
    canAccessDevice
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
