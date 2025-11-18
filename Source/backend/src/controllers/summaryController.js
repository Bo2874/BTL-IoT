import SensorData from "../models/sensorData.js";
import HourlySummary from "../models/hourlySummary.js";
import { generateAISummary } from "../services/openaiService.js";

/**
 * Tính toán thống kê từ dữ liệu thô
 */
function calculateStatistics(data) {
  if (!data || data.length === 0) {
    throw new Error("Không có dữ liệu để tính toán");
  }

  const temps = data.map(d => d.temperature);
  const humids = data.map(d => d.humidity);
  const aqis = data.map(d => d.AQI);
  const pm25s = data.map(d => d.dust);

  return {
    temperature: {
      min: Math.min(...temps),
      max: Math.max(...temps),
      avg: temps.reduce((a, b) => a + b, 0) / temps.length,
    },
    humidity: {
      min: Math.min(...humids),
      max: Math.max(...humids),
      avg: humids.reduce((a, b) => a + b, 0) / humids.length,
    },
    aqi: {
      min: Math.min(...aqis),
      max: Math.max(...aqis),
      avg: aqis.reduce((a, b) => a + b, 0) / aqis.length,
    },
    pm25: {
      min: Math.min(...pm25s),
      max: Math.max(...pm25s),
      avg: pm25s.reduce((a, b) => a + b, 0) / pm25s.length,
    },
  };
}

/**
 * Tạo summary cho 1 giờ cụ thể
 */
export const createHourlySummary = async (req, res) => {
  try {
    const { hourTimestamp } = req.body;

    if (!hourTimestamp) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tham số hourTimestamp (ISO 8601)",
      });
    }

    const targetHour = new Date(hourTimestamp);
    
    // Kiểm tra đã có summary cho giờ này chưa
    const existing = await HourlySummary.findOne({ hourTimestamp: targetHour });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Summary đã tồn tại",
        data: existing,
      });
    }

    // Lấy dữ liệu trong khoảng 1 giờ
    const startTime = new Date(targetHour);
    const endTime = new Date(targetHour.getTime() + 60 * 60 * 1000); // +1 giờ

    const hourData = await SensorData.find({
      createdAt: {
        $gte: startTime,
        $lt: endTime,
      },
    }).lean();

    if (hourData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không có dữ liệu trong khoảng thời gian này",
      });
    }

    // Tính toán thống kê
    const stats = calculateStatistics(hourData);

    // Gọi OpenAI API
    console.log(`🤖 Đang tạo AI summary cho ${targetHour.toISOString()}...`);
    const aiSummary = await generateAISummary(stats, hourData.length);

    // Lưu vào database
    const summary = new HourlySummary({
      hourTimestamp: targetHour,
      sampleCount: hourData.length,
      statistics: stats,
      aiSummary: aiSummary,
    });

    await summary.save();
    console.log(`✅ Đã lưu summary cho ${targetHour.toISOString()}`);

    res.status(201).json({
      success: true,
      message: "Tạo summary thành công",
      data: summary,
    });
  } catch (err) {
    console.error("❌ Error in createHourlySummary:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo summary",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Lấy danh sách các summaries
 */
export const getSummaries = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 24; // Mặc định 24 giờ
    
    const summaries = await HourlySummary.find()
      .sort({ hourTimestamp: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: summaries.length,
      data: summaries,
    });
  } catch (err) {
    console.error("❌ Error in getSummaries:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy summaries",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Lấy summary cho 1 giờ cụ thể
 */
export const getSummaryByHour = async (req, res) => {
  try {
    const { hourTimestamp } = req.params;
    
    const summary = await HourlySummary.findOne({
      hourTimestamp: new Date(hourTimestamp),
    }).lean();

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy summary cho giờ này",
      });
    }

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    console.error("❌ Error in getSummaryByHour:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy summary",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
