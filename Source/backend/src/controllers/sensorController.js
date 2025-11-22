import SensorData from "../models/sensorData.js";

// 🆕 Bật/Tắt còi liên tục (toggle ON/OFF)
export const toggleBuzzer = async (req, res) => {
  try {
    const { deviceId, state } = req.body; // state: "on" hoặc "off"

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu deviceId"
      });
    }

    if (!state || !["on", "off"].includes(state)) {
      return res.status(400).json({
        success: false,
        message: 'State phải là "on" hoặc "off"'
      });
    }

    // Import MQTT client động
    const { getMqttClient } = await import("../mqtt/mqttClient.js");
    const client = getMqttClient();

    if (!client || !client.connected) {
      return res.status(503).json({
        success: false,
        message: "MQTT client không kết nối"
      });
    }

    // Gửi lệnh bật/tắt còi qua MQTT
    const topic = `iot/devices/${deviceId}/buzzer/toggle`;
    const message = JSON.stringify({ 
      action: "toggle",
      state: state
    });

    client.publish(topic, message, { qos: 1 }, (err) => {
      if (err) {
        console.error("❌ Error publishing buzzer toggle command:", err);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi gửi lệnh bật/tắt còi"
        });
      }

      console.log(`🔊 Buzzer toggle sent to device ${deviceId}: ${state.toUpperCase()}`);
      res.status(200).json({
        success: true,
        message: `Đã ${state === 'on' ? 'BẬT' : 'TẮT'} còi thiết bị ${deviceId}`,
        data: { deviceId, state }
      });
    });

  } catch (err) {
    console.error("❌ Error in toggleBuzzer:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi bật/tắt còi",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// 🆕 Kích hoạt còi thủ công (beep N lần)
export const triggerBuzzer = async (req, res) => {
  try {
    const { deviceId, duration = 3 } = req.body; // duration: số lần beep (mặc định 3)

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu deviceId"
      });
    }

    // Import MQTT client động
    const { getMqttClient } = await import("../mqtt/mqttClient.js");
    const client = getMqttClient();

    if (!client || !client.connected) {
      return res.status(503).json({
        success: false,
        message: "MQTT client không kết nối"
      });
    }

    // Gửi lệnh kích hoạt còi qua MQTT
    const topic = `iot/devices/${deviceId}/buzzer`;
    const message = JSON.stringify({ 
      action: "trigger",
      duration: parseInt(duration)
    });

    client.publish(topic, message, { qos: 1 }, (err) => {
      if (err) {
        console.error("❌ Error publishing buzzer command:", err);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi gửi lệnh kích hoạt còi"
        });
      }

      console.log(`🔊 Buzzer trigger sent to device ${deviceId} (${duration} beeps)`);
      res.status(200).json({
        success: true,
        message: `Đã gửi lệnh kích hoạt còi đến thiết bị ${deviceId}`,
        data: { deviceId, duration }
      });
    });

  } catch (err) {
    console.error("❌ Error in triggerBuzzer:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi kích hoạt còi",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

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
