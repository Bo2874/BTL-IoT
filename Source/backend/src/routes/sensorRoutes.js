import express from "express";
import { getAllData, getRealtime, getHistory } from "../controllers/sensorController.js";

const router = express.Router();

// API endpoints
router.get("/", getAllData);           // GET /api/sensors
router.get("/realtime", getRealtime);  // GET /api/sensors/realtime
router.get("/history", getHistory);    // GET /api/sensors/history?limit=50

export default router;
