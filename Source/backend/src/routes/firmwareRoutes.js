import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  uploadFirmware,
  getAllFirmware,
  getLatestFirmware,
  downloadFirmware,
  deleteFirmware,
  triggerOTAUpdate,
} from "../controllers/firmwareController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Cấu hình multer để upload firmware
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/firmware"));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `firmware_${timestamp}_${sanitizedName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith(".bin")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file .bin"));
    }
  },
});

// === Admin Routes (cần auth + admin role) ===
router.post("/upload", protect, adminOnly, upload.single("firmware"), uploadFirmware);
router.get("/", protect, adminOnly, getAllFirmware);
router.delete("/:id", protect, adminOnly, deleteFirmware);
router.post("/trigger-update", protect, adminOnly, triggerOTAUpdate);

// === Public Routes (cho ESP32 - không cần auth) ===
router.get("/latest", getLatestFirmware);
router.get("/download/:version", downloadFirmware);

export default router;
