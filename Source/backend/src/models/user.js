import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false // Không trả về password khi query
  },
  name: {
    type: String,
    required: [true, 'Tên là bắt buộc'],
    trim: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Worker'],
    default: 'Worker'
  },
  // Danh sách deviceId mà Worker được phép xem (chỉ áp dụng cho Worker)
  devices: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Hash password trước khi lưu
userSchema.pre('save', async function(next) {
  // Chỉ hash nếu password được thay đổi
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method để so sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Lỗi khi xác thực mật khẩu');
  }
};

// Method kiểm tra quyền truy cập device
userSchema.methods.canAccessDevice = function(deviceId) {
  if (this.role === 'Admin') {
    return true; // Admin có quyền xem tất cả devices
  }
  return this.devices.includes(deviceId);
};

const User = mongoose.model('User', userSchema);

export default User;
