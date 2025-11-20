import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Middleware xác thực JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Lấy token từ header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Kiểm tra token có tồn tại
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để truy cập'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Lấy thông tin user từ token
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User không tồn tại'
        });
      }

      // Gán user vào request
      req.user = user;
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực',
      error: error.message
    });
  }
};

// Middleware kiểm tra role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} không có quyền truy cập`
      });
    }
    next();
  };
};

// Middleware kiểm tra Admin role (shortcut)
export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ Admin mới có quyền truy cập'
    });
  }
  next();
};

// Middleware kiểm tra quyền truy cập device
export const canAccessDevice = (req, res, next) => {
  const deviceId = req.params.deviceId || req.query.deviceId || req.body.deviceId;

  // Admin có quyền truy cập tất cả
  if (req.user.role === 'Admin') {
    return next();
  }

  // Worker chỉ truy cập devices được phép
  if (!deviceId) {
    return res.status(400).json({
      success: false,
      message: 'Device ID không được cung cấp'
    });
  }

  if (!req.user.canAccessDevice(deviceId)) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền truy cập device này'
    });
  }

  next();
};
