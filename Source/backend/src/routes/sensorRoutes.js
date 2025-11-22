import express from "express";
import { getAllData, getRealtime, getHistory, triggerBuzzer, toggleBuzzer } from "../controllers/sensorController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// API endpoints
router.get("/", getAllData);           // GET /api/sensors
router.get("/realtime", getRealtime);  // GET /api/sensors/realtime
router.get("/history", getHistory);    // GET /api/sensors/history?limit=50

// 🆕 Bật/Tắt còi liên tục (chỉ Admin)
router.post("/buzzer/toggle", protect, adminOnly, toggleBuzzer); // POST /api/sensors/buzzer/toggle

// 🆕 Kích hoạt còi thủ công - beep N lần (chỉ Admin)
router.post("/buzzer/trigger", protect, adminOnly, triggerBuzzer); // POST /api/sensors/buzzer/trigger

export default router;
