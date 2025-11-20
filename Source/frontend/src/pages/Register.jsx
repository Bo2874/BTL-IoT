import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'Worker'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.email || !formData.password || !formData.name) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Tạo user data
      const userData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role
      };

      await register(userData);
      
      // Redirect to dashboard sau khi đăng ký thành công
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🏭 IoT Air Quality</h1>
          <h2>Đăng ký tài khoản</h2>
          <p>Tạo tài khoản mới cho hệ thống giám sát</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {(error || authError) && (
            <div className="error-message">
              ❌ {error || authError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Họ và tên *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@factory.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ít nhất 6 ký tự"
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Vai trò</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Worker">Worker - Công nhân</option>
              <option value="Admin">Admin - Quản trị viên</option>
            </select>
            <small className="form-hint">
              {formData.role === 'Admin' 
                ? '👨‍💼 Admin có quyền xem tất cả thiết bị và quản lý hệ thống' 
                : '👷 Worker chỉ xem thiết bị được phân quyền'}
            </small>
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Đang đăng ký...' : '✅ Đăng ký'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Đã có tài khoản? {' '}
            <Link to="/login" className="auth-link">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
