import axios from "axios";
import { API_URL } from "../config";

export const getSummaries = async (limit = 24) => {
  const res = await axios.get(`${API_URL}/summaries?limit=${limit}`);
  return res.data;
};

export const createSummary = async (hourTimestamp) => {
  const res = await axios.post(`${API_URL}/summaries`, {
    hourTimestamp: hourTimestamp,
  });
  return res.data;
};
