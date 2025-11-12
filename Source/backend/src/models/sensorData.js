import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema({
  datetime: {
    type: String,
    required: [true, "Datetime is required"],
  },
  temperature: {
    type: Number,
    required: [true, "Temperature is required"],
    min: [-50, "Temperature must be above -50°C"],
    max: [100, "Temperature must be below 100°C"],
  },
  humidity: {
    type: Number,
    required: [true, "Humidity is required"],
    min: [0, "Humidity must be at least 0%"],
    max: [100, "Humidity must be at most 100%"],
  },
  AQI: {
    type: Number,
    required: [true, "AQI is required"],
    min: [0, "AQI must be at least 0"],
    max: [500, "AQI must be at most 500"],
  },
  dust: {
    type: Number,
    required: [true, "Dust is required"],
    min: [0, "Dust value must be non-negative"],
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true, // Index để tăng tốc query sort
  },
});

export default mongoose.model("SensorData", sensorSchema);
