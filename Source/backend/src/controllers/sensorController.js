import SensorData from "../models/sensorData.js";

// Lấy dữ liệu realtime (bản ghi mới nhất)
export const getRealtime = async (req, res) => {
  try {
    const latest = await SensorData.findOne()
      .sort({ createdAt: -1 })
      .lean();

    if (!latest) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dữ liệu"
      });
    }

    // Transform data để khớp với frontend
    const response = {
      aqi: latest.AQI,
      temperature: latest.temperature,
      humidity: latest.humidity,
      pm25: latest.dust,
      time: latest.datetime,
      createdAt: latest.createdAt
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("❌ Error in getRealtime:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy dữ liệu realtime",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// Lấy lịch sử dữ liệu
export const getHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const data = await SensorData.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dữ liệu",
        data: []
      });
    }

    // Transform data để khớp với frontend
    const response = data.map(item => ({
      aqi: item.AQI,
      temperature: item.temperature,
      humidity: item.humidity,
      pm25: item.dust,
      time: item.datetime,
      createdAt: item.createdAt
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error("❌ Error in getHistory:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch sử",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// Lấy 50 bản ghi gần nhất (API cũ, giữ lại để tương thích)
export const getAllData = async (req, res) => {
  try {
    const data = await SensorData.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

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
