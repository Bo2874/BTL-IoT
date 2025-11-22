import mqtt from "mqtt";
import mqttConfig from "../config/mqttConfig.js";
import SensorData from "../models/sensorData.js";
import { emitSensorUpdate } from "../realtime/socket.js";

const options = {
  clientId: mqttConfig.clientId,
  username: mqttConfig.username,
  password: mqttConfig.password,
  port: mqttConfig.port,
  rejectUnauthorized: true,
  reconnectPeriod: 5000, // Tự động reconnect sau 5 giây
  connectTimeout: 30000, // Timeout 30 giây
};

console.log("🔄 Connecting to HiveMQ Cloud...");

const client = mqtt.connect(mqttConfig.brokerUrl, options);

client.on("connect", () => {
  console.log("✅ Connected to HiveMQ Cloud");
  client.subscribe(mqttConfig.topic, (err) => {
    if (err) console.error("❌ Subscribe failed:", err);
    else console.log(`📡 Subscribed to topic: ${mqttConfig.topic}`);
  });
});

client.on("reconnect", () => {
  console.log("🔄 Attempting to reconnect to MQTT...");
});

client.on("offline", () => {
  console.warn("⚠️ MQTT client is offline");
});

client.on("error", (err) => {
  console.error("❌ MQTT connection error:", err);
});

client.on("close", () => {
  console.warn("⚠️ MQTT connection closed");
});

client.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log("📥 Received:", data);

    // Validate dữ liệu trước khi lưu
    if (!data.datetime || 
        typeof data.temperature !== 'number' || 
        typeof data.humidity !== 'number' || 
        typeof data.AQI !== 'number' || 
        typeof data.dust !== 'number') {
      console.error("⚠️ Invalid data format:", data);
      return;
    }

    // Kiểm tra giá trị hợp lệ
    if (data.temperature < -50 || data.temperature > 100) {
      console.error("⚠️ Temperature out of range:", data.temperature);
      return;
    }

    if (data.humidity < 0 || data.humidity > 100) {
      console.error("⚠️ Humidity out of range:", data.humidity);
      return;
    }

    if (data.AQI < 0 || data.AQI > 500) {
      console.error("⚠️ AQI out of range:", data.AQI);
      return;
    }

    if (data.dust < 0) {
      console.error("⚠️ Dust value negative:", data.dust);
      return;
    }

    // Lưu dữ liệu vào MongoDB
    const newData = new SensorData({
      datetime: data.datetime,
      temperature: data.temperature,
      humidity: data.humidity,
      AQI: data.AQI,
      dust: data.dust,
    });

    await newData.save();
    console.log("💾 Saved to MongoDB");

    // Emit realtime update via Socket.IO
    const payload = {
      aqi: newData.AQI,
      temperature: newData.temperature,
      humidity: newData.humidity,
      pm25: newData.dust,
      time: newData.datetime,
      createdAt: newData.createdAt
    };
    try {
      emitSensorUpdate(payload);
    } catch (e) {
      // Socket not initialized yet or error; log and continue
      console.warn("⚠️ Socket emit skipped:", e.message);
    }

  } catch (err) {
    console.error("⚠️ Error processing MQTT message:", err.message);
  }
});

// Export hàm để lấy MQTT client instance
export const getMqttClient = () => client;

export default client;
