import cron from "node-cron";
import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

/**
 * Scheduled job chạy mỗi giờ để tạo AI summary
 * Chạy vào phút thứ 5 của mỗi giờ (để đảm bảo có đủ dữ liệu)
 */
export function initScheduledJobs() {
  // Chạy lúc phút thứ 5 mỗi giờ: 0:05, 1:05, 2:05...
  cron.schedule("5 * * * *", async () => {
    try {
      const now = new Date();
      // Tạo summary cho giờ vừa qua
      const lastHour = new Date(now);
      lastHour.setHours(now.getHours() - 1);
      lastHour.setMinutes(0, 0, 0);

      console.log(`⏰ [Scheduled Job] Tạo summary cho ${lastHour.toISOString()}`);

      const response = await axios.post(
        `${BACKEND_URL}/api/summaries`,
        {
          hourTimestamp: lastHour.toISOString(),
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 60000, // 60s timeout
        }
      );

      console.log(`✅ [Scheduled Job] Hoàn thành:`, response.data.message);
    } catch (error) {
      console.error(
        `❌ [Scheduled Job] Lỗi:`,
        error.response?.data?.message || error.message
      );
    }
  });

  console.log("⏰ Scheduled job đã được khởi động (chạy mỗi giờ lúc phút thứ 5)");
}
