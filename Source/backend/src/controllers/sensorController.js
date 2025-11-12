import SensorData from "../models/sensorData.js";

// Lấy 50 bản ghi gần nhất
export const getAllData = async (req, res) => {
  try {
    const data = await SensorData.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(); // Tăng performance

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dữ liệu",
        data: []
      });
    }

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    console.error("❌ Error in getAllData:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy dữ liệu",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};
