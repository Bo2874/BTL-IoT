import axios from "axios";
import { API_BASE_URL } from "../config.js";

const API_URL = `${API_BASE_URL}/firmware`;

/**
 * Upload firmware file
 */
export const uploadFirmware = async (formData, token) => {
  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Get all firmware versions
 */
export const getAllFirmware = async (token) => {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Get latest firmware info (for ESP32)
 */
export const getLatestFirmware = async (currentVersion) => {
  const response = await axios.get(`${API_URL}/latest`, {
    params: { current: currentVersion },
  });
  return response.data;
};

/**
 * Trigger OTA update for device
 */
export const triggerOTAUpdate = async (deviceId, version, token) => {
  const response = await axios.post(
    `${API_URL}/trigger-update`,
    { deviceId, version },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Delete firmware
 */
export const deleteFirmware = async (id, token) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
