import Device from '../models/device.js';
import User from '../models/user.js';

// @desc    Lấy danh sách tất cả devices
// @route   GET /api/devices
// @access  Private
export const getDevices = async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    // Worker chỉ xem devices được assign
    if (user.role === 'Worker') {
      query.assignedWorkers = user._id;
    }

    const devices = await Device.find(query)
      .populate('assignedWorkers', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: devices.length,
      devices
    });

  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách thiết bị',
      error: error.message
    });
  }
};

// @desc    Lấy thông tin 1 device
// @route   GET /api/devices/:id
// @access  Private
export const getDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id)
      .populate('assignedWorkers', 'name email role');

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thiết bị'
      });
    }

    // Kiểm tra quyền truy cập
    if (!device.canBeAccessedBy(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem thiết bị này'
      });
    }

    res.json({
      success: true,
      device
    });

  } catch (error) {
    console.error('Get device error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin thiết bị',
      error: error.message
    });
  }
};

// @desc    Tạo device mới
// @route   POST /api/devices
// @access  Private (Admin only)
export const createDevice = async (req, res) => {
  try {
    const { deviceId, name, location, firmwareVersion, macAddress, ipAddress } = req.body;

    // Kiểm tra device đã tồn tại
    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(400).json({
        success: false,
        message: 'Device ID đã tồn tại'
      });
    }

    const device = await Device.create({
      deviceId,
      name,
      location,
      firmwareVersion,
      macAddress,
      ipAddress,
      status: 'offline',
      assignedWorkers: []
    });

    res.status(201).json({
      success: true,
      message: 'Tạo thiết bị thành công',
      device
    });

  } catch (error) {
    console.error('Create device error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo thiết bị',
      error: error.message
    });
  }
};

// @desc    Cập nhật device
// @route   PUT /api/devices/:id
// @access  Private (Admin only)
export const updateDevice = async (req, res) => {
  try {
    const { name, location, status, firmwareVersion, assignedWorkers } = req.body;

    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thiết bị'
      });
    }

    // Update các field
    if (name) device.name = name;
    if (location) device.location = location;
    if (status) device.status = status;
    if (firmwareVersion) device.firmwareVersion = firmwareVersion;
    if (assignedWorkers) device.assignedWorkers = assignedWorkers;

    await device.save();

    const updatedDevice = await Device.findById(device._id)
      .populate('assignedWorkers', 'name email');

    res.json({
      success: true,
      message: 'Cập nhật thiết bị thành công',
      device: updatedDevice
    });

  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thiết bị',
      error: error.message
    });
  }
};

// @desc    Xóa device
// @route   DELETE /api/devices/:id
// @access  Private (Admin only)
export const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thiết bị'
      });
    }

    await device.deleteOne();

    res.json({
      success: true,
      message: 'Xóa thiết bị thành công'
    });

  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa thiết bị',
      error: error.message
    });
  }
};

// @desc    Assign workers to device
// @route   POST /api/devices/:id/assign
// @access  Private (Admin only)
export const assignWorkers = async (req, res) => {
  try {
    const { workerIds } = req.body;
    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thiết bị'
      });
    }

    // Verify workers exist và là Worker role
    const workers = await User.find({
      _id: { $in: workerIds },
      role: 'Worker'
    });

    if (workers.length !== workerIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Một số user không tồn tại hoặc không phải Worker'
      });
    }

    device.assignedWorkers = workerIds;
    await device.save();

    // Update devices list trong User model
    for (const workerId of workerIds) {
      const worker = await User.findById(workerId);
      if (!worker.devices.includes(device.deviceId)) {
        worker.devices.push(device.deviceId);
        await worker.save();
      }
    }

    const updatedDevice = await Device.findById(device._id)
      .populate('assignedWorkers', 'name email');

    res.json({
      success: true,
      message: 'Phân quyền workers thành công',
      device: updatedDevice
    });

  } catch (error) {
    console.error('Assign workers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi phân quyền workers',
      error: error.message
    });
  }
};
