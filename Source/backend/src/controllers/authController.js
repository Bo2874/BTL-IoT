import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Device from '../models/device.js';

// Tạo JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Đăng ký user mới
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { email, password, name, role, devices } = req.body;

    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Tạo user mới
    const userData = {
      email,
      password,
      name,
      role: role || 'Worker'
    };

    // Nếu là Worker, thêm danh sách devices
    if (userData.role === 'Worker' && devices) {
      userData.devices = devices;
    }

    const user = await User.create(userData);

    // Tạo token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        devices: user.devices
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký',
      error: error.message
    });
  }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu'
      });
    }

    // Tìm user (bao gồm password)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Cập nhật lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Admin thấy tất cả devices, Worker chỉ thấy devices được assign
    let deviceCount = 0;
    if (user.role === 'Admin') {
      deviceCount = await Device.countDocuments();
    } else {
      deviceCount = user.devices ? user.devices.length : 0;
    }

    // Tạo token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        devices: user.devices,
        deviceCount: deviceCount,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập',
      error: error.message
    });
  }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Admin thấy tất cả devices, Worker chỉ thấy devices được assign
    let deviceCount = 0;
    if (user.role === 'Admin') {
      deviceCount = await Device.countDocuments();
    } else {
      deviceCount = user.devices ? user.devices.length : 0;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        devices: user.devices,
        deviceCount: deviceCount,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin',
      error: error.message
    });
  }
};

// @desc    Đăng xuất
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Client sẽ xóa token, server chỉ trả response
    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng xuất',
      error: error.message
    });
  }
};

// @desc    Cập nhật thông tin user
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, devices } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Cập nhật thông tin
    if (name) user.name = name;
    if (devices && user.role === 'Worker') user.devices = devices;

    await user.save();

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        devices: user.devices
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật',
      error: error.message
    });
  }
};
