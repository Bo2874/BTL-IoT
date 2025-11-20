import { API_BASE_URL } from '../config';

const AUTH_API = `${API_BASE_URL}/auth`;

// Helper để lấy token từ localStorage
const getToken = () => localStorage.getItem('token');

// Helper để lưu token
const setToken = (token) => localStorage.setItem('token', token);

// Helper để xóa token
const removeToken = () => localStorage.removeItem('token');

// Đăng ký user mới
export const register = async (userData) => {
  try {
    const response = await fetch(`${AUTH_API}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng ký thất bại');
    }

    // Lưu token
    if (data.token) {
      setToken(data.token);
    }

    return data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

// Đăng nhập
export const login = async (credentials) => {
  try {
    const response = await fetch(`${AUTH_API}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }

    // Lưu token
    if (data.token) {
      setToken(data.token);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Đăng xuất
export const logout = async () => {
  try {
    const token = getToken();
    
    if (token) {
      await fetch(`${AUTH_API}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    removeToken();
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    removeToken(); // Vẫn xóa token dù có lỗi
    throw error;
  }
};

// Lấy thông tin profile
export const getProfile = async () => {
  try {
    const token = getToken();

    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${AUTH_API}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        removeToken(); // Token hết hạn
      }
      throw new Error(data.message || 'Không thể lấy thông tin');
    }

    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

// Cập nhật profile
export const updateProfile = async (updateData) => {
  try {
    const token = getToken();

    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${AUTH_API}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Cập nhật thất bại');
    }

    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// Kiểm tra xem user đã đăng nhập chưa
export const isAuthenticated = () => {
  return !!getToken();
};

// Export token helpers
export { getToken, setToken, removeToken };
