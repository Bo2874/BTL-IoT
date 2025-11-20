import { API_BASE_URL } from '../config';
import { getToken } from './auth';

const DEVICES_API = `${API_BASE_URL}/devices`;

// Lấy danh sách devices
export const getDevices = async () => {
  try {
    const token = getToken();
    const response = await fetch(DEVICES_API, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Không thể lấy danh sách thiết bị');
    }

    return data;
  } catch (error) {
    console.error('Get devices error:', error);
    throw error;
  }
};

// Lấy thông tin 1 device
export const getDevice = async (id) => {
  try {
    const token = getToken();
    const response = await fetch(`${DEVICES_API}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Không thể lấy thông tin thiết bị');
    }

    return data;
  } catch (error) {
    console.error('Get device error:', error);
    throw error;
  }
};

// Tạo device mới (Admin only)
export const createDevice = async (deviceData) => {
  try {
    const token = getToken();
    const response = await fetch(DEVICES_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deviceData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Không thể tạo thiết bị');
    }

    return data;
  } catch (error) {
    console.error('Create device error:', error);
    throw error;
  }
};

// Cập nhật device (Admin only)
export const updateDevice = async (id, deviceData) => {
  try {
    const token = getToken();
    const response = await fetch(`${DEVICES_API}/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deviceData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Không thể cập nhật thiết bị');
    }

    return data;
  } catch (error) {
    console.error('Update device error:', error);
    throw error;
  }
};

// Xóa device (Admin only)
export const deleteDevice = async (id) => {
  try {
    const token = getToken();
    const response = await fetch(`${DEVICES_API}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Không thể xóa thiết bị');
    }

    return data;
  } catch (error) {
    console.error('Delete device error:', error);
    throw error;
  }
};

// Assign workers to device (Admin only)
export const assignWorkers = async (deviceId, workerIds) => {
  try {
    const token = getToken();
    const response = await fetch(`${DEVICES_API}/${deviceId}/assign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ workerIds })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Không thể phân quyền workers');
    }

    return data;
  } catch (error) {
    console.error('Assign workers error:', error);
    throw error;
  }
};
