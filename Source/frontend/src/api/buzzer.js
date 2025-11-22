import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Bật/Tắt còi liên tục
 * @param {string} deviceId - ID của thiết bị
 * @param {string} state - "on" hoặc "off"
 */
export const toggleBuzzer = async (deviceId, state) => {
  const response = await api.post('/sensors/buzzer/toggle', {
    deviceId,
    state
  });
  return response.data;
};

/**
 * Kích hoạt còi thủ công (beep N lần)
 * @param {string} deviceId - ID của thiết bị
 * @param {number} duration - Số lần beep (mặc định 3)
 */
export const triggerBuzzer = async (deviceId, duration = 3) => {
  const response = await api.post('/sensors/buzzer/trigger', {
    deviceId,
    duration
  });
  return response.data;
};
