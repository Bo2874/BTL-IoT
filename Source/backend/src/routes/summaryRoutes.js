import express from "express";
import {
  createHourlySummary,
  getSummaries,
  getSummaryByHour,
} from "../controllers/summaryController.js";

const router = express.Router();

// Tạo summary cho 1 giờ (thường gọi bởi scheduled job hoặc manual)
router.post("/", createHourlySummary);

// Lấy danh sách summaries
router.get("/", getSummaries);

// Lấy summary cho 1 giờ cụ thể
router.get("/:hourTimestamp", getSummaryByHour);

export default router;
