import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  // Đang load authentication state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Loader />
      </div>
    );
  }

  // Chưa đăng nhập -> redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route chỉ cho Admin
  if (adminOnly && !isAdmin()) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: '20px'
      }}>
        <h2>🚫 Không có quyền truy cập</h2>
        <p>Tính năng này chỉ dành cho Admin</p>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          ← Về Dashboard
        </button>
      </div>
    );
  }

  // Cho phép truy cập
  return children;
};

export default ProtectedRoute;
