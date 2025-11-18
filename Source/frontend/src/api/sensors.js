import axios from "axios";
import { API_URL } from "../config";

export const getRealtime = async () => {
  const res = await axios.get(`${API_URL}/sensors/realtime`);
  return res.data;
};

export const getHistory = async (limit = 100) => {
  const res = await axios.get(`${API_URL}/sensors/history?limit=${limit}`);
  return res.data;
};
