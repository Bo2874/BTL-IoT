import Firmware from "../models/firmware.js";
import Device from "../models/device.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn thư mục lưu firmware
const FIRMWARE_DIR = path.join(__dirname, "../../uploads/firmware");

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(FIRMWARE_DIR)) {
  fs.mkdirSync(FIRMWARE_DIR, { recursive: true });
}

/**
 * Tính MD5 hash của file
 */
function calculateMD5(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash("md5");
  hashSum.update(fileBuffer);
  return hashSum.digest("hex");
}

/**
 * Upload firmware mới
 * POST /api/firmware/upload
 */
export const uploadFirmware = async (req, res) => {
  try {
    const { version, releaseNotes } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Không có file được upload" });
    }

    if (!version) {
      // Xóa file đã upload nếu thiếu version
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Thiếu version" });
    }

    // Kiểm tra firmware version đã tồn tại chưa
    const existingFirmware = await Firmware.findOne({ version });
    if (existingFirmware) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: `Firmware version ${version} đã tồn tại` });
    }

    // Kiểm tra file có phải .bin không
    if (!req.file.originalname.endsWith(".bin")) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Chỉ chấp nhận file .bin" });
    }

    // Tính MD5 hash
    const md5Hash = calculateMD5(req.file.path);

    // Lưu thông tin vào database
    const firmware = new Firmware({
      version,
      filename: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      md5Hash,
      releaseNotes: releaseNotes || "",
      uploadedBy: req.user._id,
    });

    await firmware.save();

    res.status(201).json({
      message: "Upload firmware thành công",
      firmware: {
        _id: firmware._id,
        version: firmware.version,
        filename: firmware.filename,
        fileSize: firmware.fileSize,
        md5Hash: firmware.md5Hash,
        releaseNotes: firmware.releaseNotes,
        createdAt: firmware.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload firmware error:", error);
    // Xóa file nếu có lỗi
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Lỗi server khi upload firmware" });
  }
};

/**
 * Lấy danh sách tất cả firmware
 * GET /api/firmware
 */
export const getAllFirmware = async (req, res) => {
  try {
    const firmwares = await Firmware.find()
      .populate("uploadedBy", "username email")
      .sort({ createdAt: -1 });

    res.json({
      firmwares: firmwares.map((fw) => ({
        _id: fw._id,
        version: fw.version,
        filename: fw.filename,
        fileSize: fw.fileSize,
        md5Hash: fw.md5Hash,
        releaseNotes: fw.releaseNotes,
        downloadCount: fw.downloadCount,
        isActive: fw.isActive,
        uploadedBy: fw.uploadedBy?.username || "Unknown",
        createdAt: fw.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get firmware list error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách firmware" });
  }
};

/**
 * Lấy thông tin firmware mới nhất (cho ESP32 check update)
 * GET /api/firmware/latest
 */
export const getLatestFirmware = async (req, res) => {
  try {
    const currentVersion = req.query.current || "0.0.0";

    const latestFirmware = await Firmware.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .select("version md5Hash fileSize releaseNotes createdAt");

    if (!latestFirmware) {
      return res.json({
        hasUpdate: false,
        message: "Không có firmware khả dụng",
      });
    }

    // So sánh version (đơn giản: so sánh string)
    const hasUpdate = latestFirmware.version !== currentVersion;

    res.json({
      hasUpdate,
      currentVersion,
      latestVersion: latestFirmware.version,
      fileSize: latestFirmware.fileSize,
      md5Hash: latestFirmware.md5Hash,
      releaseNotes: latestFirmware.releaseNotes,
      downloadUrl: hasUpdate ? `/api/firmware/download/${latestFirmware.version}` : null,
    });
  } catch (error) {
    console.error("Get latest firmware error:", error);
    res.status(500).json({ message: "Lỗi server khi kiểm tra firmware" });
  }
};

/**
 * Download firmware file (cho ESP32)
 * GET /api/firmware/download/:version
 */
export const downloadFirmware = async (req, res) => {
  try {
    const { version } = req.params;

    const firmware = await Firmware.findOne({ version, isActive: true });

    if (!firmware) {
      return res.status(404).json({ message: "Không tìm thấy firmware" });
    }

    if (!fs.existsSync(firmware.filePath)) {
      return res.status(404).json({ message: "File firmware không tồn tại" });
    }

    // Tăng download count
    firmware.downloadCount += 1;
    await firmware.save();

    // Set headers
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${firmware.filename}"`);
    res.setHeader("Content-Length", firmware.fileSize);
    res.setHeader("X-MD5-Hash", firmware.md5Hash);

    // Stream file
    const fileStream = fs.createReadStream(firmware.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Download firmware error:", error);
    res.status(500).json({ message: "Lỗi server khi download firmware" });
  }
};

/**
 * Xóa firmware
 * DELETE /api/firmware/:id
 */
export const deleteFirmware = async (req, res) => {
  try {
    const { id } = req.params;

    const firmware = await Firmware.findById(id);
    if (!firmware) {
      return res.status(404).json({ message: "Không tìm thấy firmware" });
    }

    // Xóa file vật lý
    if (fs.existsSync(firmware.filePath)) {
      fs.unlinkSync(firmware.filePath);
    }

    // Xóa record trong database
    await Firmware.findByIdAndDelete(id);

    res.json({ message: "Xóa firmware thành công" });
  } catch (error) {
    console.error("Delete firmware error:", error);
    res.status(500).json({ message: "Lỗi server khi xóa firmware" });
  }
};

/**
 * Trigger OTA update cho device (gửi MQTT message)
 * POST /api/firmware/trigger-update
 */
export const triggerOTAUpdate = async (req, res) => {
  try {
    const { deviceId, version } = req.body;

    if (!deviceId || !version) {
      return res.status(400).json({ message: "Thiếu deviceId hoặc version" });
    }

    // Kiểm tra device tồn tại
    const device = await Device.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({ message: "Không tìm thấy device" });
    }

    // Kiểm tra firmware tồn tại
    const firmware = await Firmware.findOne({ version, isActive: true });
    if (!firmware) {
      return res.status(404).json({ message: "Không tìm thấy firmware version này" });
    }

    // Import MQTT client động để tránh circular dependency
    const { getMqttClient } = await import("../mqtt/mqttClient.js");
    const mqttClient = getMqttClient();

    if (!mqttClient || !mqttClient.connected) {
      return res.status(503).json({ message: "MQTT client chưa kết nối" });
    }

    // Gửi MQTT message để trigger OTA
    const otaTopic = `iot/devices/${deviceId}/ota`;
    const otaPayload = JSON.stringify({
      command: "update",
      version: firmware.version,
      downloadUrl: `${req.protocol}://${req.get("host")}/api/firmware/download/${firmware.version}`,
      md5Hash: firmware.md5Hash,
      fileSize: firmware.fileSize,
    });

    mqttClient.publish(otaTopic, otaPayload, { qos: 1 }, (err) => {
      if (err) {
        console.error("MQTT publish error:", err);
        return res.status(500).json({ message: "Lỗi khi gửi lệnh OTA" });
      }

      console.log(`✅ OTA trigger sent to ${deviceId} - version ${version}`);
      res.json({
        message: `Đã gửi lệnh OTA update tới device ${deviceId}`,
        version: firmware.version,
        deviceId,
      });
    });
  } catch (error) {
    console.error("Trigger OTA error:", error);
    res.status(500).json({ message: "Lỗi server khi trigger OTA update" });
  }
};
