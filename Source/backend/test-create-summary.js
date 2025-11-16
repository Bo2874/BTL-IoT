import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

async function createSummary(hoursAgo = 1) {
  try {
    const now = new Date();
    const targetHour = new Date(now);
    targetHour.setHours(now.getHours() - hoursAgo);
    targetHour.setMinutes(0, 0, 0);

    console.log(`\n🤖 Tạo summary cho: ${targetHour.toLocaleString('vi-VN')}`);
    console.log(`⏰ Timestamp: ${targetHour.toISOString()}\n`);

    const response = await axios.post(
      `${BACKEND_URL}/api/summaries`,
      {
        hourTimestamp: targetHour.toISOString(),
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 60000,
      }
    );

    console.log("✅ Thành công!\n");
    console.log("📊 Kết quả:");
    console.log(`   - Số mẫu: ${response.data.data.sampleCount}`);
    console.log(`   - AQI TB: ${Math.round(response.data.data.statistics.aqi.avg)}`);
    console.log(`   - Nhiệt độ TB: ${response.data.data.statistics.temperature.avg.toFixed(1)}°C`);
    console.log(`\n📝 AI Summary:\n`);
    console.log(response.data.data.aiSummary);
    console.log("\n" + "=".repeat(60) + "\n");

  } catch (error) {
    console.error("❌ Lỗi:", error.response?.data?.message || error.message);
    if (error.response?.data?.message === "Không có dữ liệu trong khoảng thời gian này") {
      console.log("\n💡 Tip: Đảm bảo có dữ liệu sensor trong khoảng thời gian đó.");
      console.log("   Thử tạo summary cho giờ khác bằng: node test-create-summary.js <số_giờ_trước>");
    }
  }
}

// Lấy tham số từ command line (mặc định: 1 giờ trước)
const hoursAgo = parseInt(process.argv[2]) || 1;

console.log("\n" + "=".repeat(60));
console.log("🏭 TEST TẠO AI SUMMARY CHO NHÀ MÁY");
console.log("=".repeat(60));

createSummary(hoursAgo);
