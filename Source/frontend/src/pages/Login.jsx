import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error khi user nhập
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.email || !formData.password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await login(formData);
      
      // Redirect to dashboard sau khi login thành công
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🏭 IoT Air Quality</h1>
          <h2>Đăng nhập</h2>
          <p>Hệ thống giám sát chất lượng không khí nhà máy</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {(error || authError) && (
            <div className="error-message">
              ❌ {error || authError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@factory.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Đang đăng nhập...' : '🔐 Đăng nhập'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Chưa có tài khoản? {' '}
            <Link to="/register" className="auth-link">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <div className="demo-accounts">
          <p className="demo-title">💡 Tài khoản demo:</p>
          <div className="demo-list">
            <div className="demo-item">
              <strong>Admin:</strong> admin@factory.com / admin123
            </div>
            <div className="demo-item">
              <strong>Worker:</strong> worker1@factory.com / worker123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
