import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDevices, createDevice, updateDevice, deleteDevice, assignWorkers } from '../api/devices';
import { getUsers } from '../api/users';
import '../styles/admin.css';

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [error, setError] = useState('');

  const [newDevice, setNewDevice] = useState({
    deviceId: '',
    name: '',
    location: '',
    firmwareVersion: '1.0.0',
    macAddress: '',
    ipAddress: ''
  });

  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const devicesData = await getDevices();
      setDevices(devicesData.devices || []);
      
      // Load users for assignment
      const usersData = await getUsers();
      setUsers(usersData.data || []);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    try {
      await createDevice(newDevice);
      setShowAddModal(false);
      setNewDevice({
        deviceId: '',
        name: '',
        location: '',
        firmwareVersion: '1.0.0',
        macAddress: '',
        ipAddress: ''
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateDevice = async (e) => {
    e.preventDefault();
    try {
      await updateDevice(selectedDevice._id, selectedDevice);
      setShowEditModal(false);
      setSelectedDevice(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa thiết bị này?')) return;
    
    try {
      await deleteDevice(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAssignWorkers = async (e) => {
    e.preventDefault();
    try {
      await assignWorkers(selectedDevice._id, selectedWorkers);
      setShowAssignModal(false);
      setSelectedDevice(null);
      setSelectedWorkers([]);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleWorkerToggle = (userId) => {
    setSelectedWorkers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      online: '🟢 Online',
      offline: '🔴 Offline',
      maintenance: '🟠 Bảo trì'
    };
    return badges[status] || status;
  };

  if (!isAdmin()) {
    return (
      <div className="access-denied">
        <h2>🚫 Không có quyền truy cập</h2>
        <p>Tính năng này chỉ dành cho Admin</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">⏳ Đang tải...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🛠️ Admin Panel - Quản lý Thiết bị</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          ➕ Thêm Thiết bị Mới
        </button>
      </div>

      {error && (
        <div className="error-banner">
          ❌ {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div className="devices-grid">
        {devices.length === 0 ? (
          <div className="empty-state">
            <p>📭 Chưa có thiết bị nào</p>
            <button onClick={() => setShowAddModal(true)}>
              Thêm thiết bị đầu tiên
            </button>
          </div>
        ) : (
          devices.map(device => (
            <div key={device._id} className="device-card">
              <div className="device-header">
                <h3>{device.name}</h3>
                <span className={`status-badge status-${device.status}`}>
                  {getStatusBadge(device.status)}
                </span>
              </div>
              
              <div className="device-info">
                <p><strong>Device ID:</strong> {device.deviceId}</p>
                <p><strong>Vị trí:</strong> {device.location}</p>
                <p><strong>Firmware:</strong> {device.firmwareVersion}</p>
                <p><strong>IP:</strong> {device.ipAddress || 'N/A'}</p>
                <p><strong>MAC:</strong> {device.macAddress || 'N/A'}</p>
                <p>
                  <strong>Workers được phép:</strong>{' '}
                  {device.assignedWorkers?.length || 0} người
                </p>
              </div>

              <div className="device-actions">
                <button 
                  className="btn-edit"
                  onClick={() => {
                    setSelectedDevice(device);
                    setShowEditModal(true);
                  }}
                >
                  ✏️ Sửa
                </button>
                <button 
                  className="btn-assign"
                  onClick={() => {
                    setSelectedDevice(device);
                    setSelectedWorkers(device.assignedWorkers?.map(w => w._id || w) || []);
                    setShowAssignModal(true);
                  }}
                >
                  👥 Phân quyền
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDeleteDevice(device._id)}
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>➕ Thêm Thiết bị Mới</h2>
            <form onSubmit={handleCreateDevice}>
              <input
                type="text"
                placeholder="Device ID (vd: ESP32_001)"
                value={newDevice.deviceId}
                onChange={(e) => setNewDevice({...newDevice, deviceId: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Tên thiết bị"
                value={newDevice.name}
                onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Vị trí (vd: Phân xưởng A)"
                value={newDevice.location}
                onChange={(e) => setNewDevice({...newDevice, location: e.target.value})}
              />
              <input
                type="text"
                placeholder="Firmware Version (vd: 1.0.0)"
                value={newDevice.firmwareVersion}
                onChange={(e) => setNewDevice({...newDevice, firmwareVersion: e.target.value})}
              />
              <input
                type="text"
                placeholder="MAC Address"
                value={newDevice.macAddress}
                onChange={(e) => setNewDevice({...newDevice, macAddress: e.target.value})}
              />
              <input
                type="text"
                placeholder="IP Address"
                value={newDevice.ipAddress}
                onChange={(e) => setNewDevice({...newDevice, ipAddress: e.target.value})}
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Tạo Thiết bị</button>
                <button type="button" onClick={() => setShowAddModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Device Modal */}
      {showEditModal && selectedDevice && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>✏️ Sửa Thiết bị</h2>
            <form onSubmit={handleUpdateDevice}>
              <input
                type="text"
                placeholder="Tên thiết bị"
                value={selectedDevice.name}
                onChange={(e) => setSelectedDevice({...selectedDevice, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Vị trí"
                value={selectedDevice.location}
                onChange={(e) => setSelectedDevice({...selectedDevice, location: e.target.value})}
              />
              <select
                value={selectedDevice.status}
                onChange={(e) => setSelectedDevice({...selectedDevice, status: e.target.value})}
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="maintenance">Bảo trì</option>
              </select>
              <input
                type="text"
                placeholder="Firmware Version"
                value={selectedDevice.firmwareVersion}
                onChange={(e) => setSelectedDevice({...selectedDevice, firmwareVersion: e.target.value})}
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Cập nhật</button>
                <button type="button" onClick={() => setShowEditModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Workers Modal */}
      {showAssignModal && selectedDevice && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>👥 Phân quyền Workers cho {selectedDevice.name}</h2>
            <form onSubmit={handleAssignWorkers}>
              <div className="workers-list">
                {users.filter(u => u.role === 'Worker').length === 0 ? (
                  <p className="no-workers">Không có Worker nào trong hệ thống</p>
                ) : (
                  users.filter(u => u.role === 'Worker').map(worker => (
                    <label key={worker._id} className="worker-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedWorkers.includes(worker._id)}
                        onChange={() => handleWorkerToggle(worker._id)}
                      />
                      <div className="worker-info">
                        <span className="worker-name">{worker.name}</span>
                        <span className="worker-email">{worker.email}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <div className="selected-count">
                Đã chọn: {selectedWorkers.length} worker(s)
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  💾 Lưu phân quyền
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedWorkers([]);
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
