import dotenv from "dotenv";
dotenv.config();

export default {
  brokerUrl: process.env.MQTT_BROKER_URL || "mqtts://3c86c6e739d544f99df58aac160e686f.s1.eu.hivemq.cloud",
  port: parseInt(process.env.MQTT_PORT) || 8883,
  username: process.env.MQTT_USERNAME || "esp32-air-system",
  password: process.env.MQTT_PASSWORD || "Airsystem12345",
  topic: process.env.MQTT_TOPIC || "home/room1/sensors",
  clientId: "backend-" + Math.random().toString(16).substring(2, 8),
};
