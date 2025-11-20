import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: [true, 'Device ID là bắt buộc'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Tên thiết bị là bắt buộc'],
    trim: true
  },
  location: {
    type: String,
    default: 'Chưa xác định',
    trim: true
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'maintenance'],
    default: 'offline'
  },
  // Danh sách user IDs được phép xem device này
  assignedWorkers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Thông tin firmware
  firmwareVersion: {
    type: String,
    default: '1.0.0'
  },
  lastFirmwareUpdate: {
    type: Date
  },
  // Metadata
  ipAddress: {
    type: String
  },
  macAddress: {
    type: String
  },
  // Thông tin hoạt động
  lastSeen: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt trước khi save
deviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method kiểm tra xem user có quyền truy cập không
deviceSchema.methods.canBeAccessedBy = function(user) {
  if (!user) return false;
  if (user.role === 'Admin') return true;
  
  // Worker chỉ được xem nếu được assign
  return this.assignedWorkers.some(workerId => 
    workerId.toString() === user._id.toString()
  );
};

const Device = mongoose.model('Device', deviceSchema);

export default Device;
