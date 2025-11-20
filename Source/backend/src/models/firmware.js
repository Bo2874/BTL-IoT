import mongoose from "mongoose";

const firmwareSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    md5Hash: {
      type: String,
      required: true,
    },
    releaseNotes: {
      type: String,
      default: "",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh firmware mới nhất
firmwareSchema.index({ createdAt: -1 });
firmwareSchema.index({ version: 1 });
firmwareSchema.index({ isActive: 1 });

const Firmware = mongoose.model("Firmware", firmwareSchema);

export default Firmware;
