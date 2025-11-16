import mongoose from "mongoose";

const hourlySummarySchema = new mongoose.Schema({
  hourTimestamp: {
    type: Date,
    required: true,
    index: true,
    unique: true, // Mỗi giờ chỉ có 1 summary
  },
  sampleCount: {
    type: Number,
    required: true,
  },
  statistics: {
    temperature: {
      min: Number,
      max: Number,
      avg: Number,
    },
    humidity: {
      min: Number,
      max: Number,
      avg: Number,
    },
    aqi: {
      min: Number,
      max: Number,
      avg: Number,
    },
    pm25: {
      min: Number,
      max: Number,
      avg: Number,
    },
  },
  aiSummary: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

export default mongoose.model("HourlySummary", hourlySummarySchema);
