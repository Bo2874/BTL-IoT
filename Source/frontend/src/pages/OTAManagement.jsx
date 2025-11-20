import { useState, useEffect } from "react";
import { getAllFirmware, uploadFirmware, deleteFirmware, triggerOTAUpdate } from "../api/firmware";
import { getDevices } from "../api/devices";
import Loader from "../components/Loader";
import "../styles/ota.css";

export default function OTAManagement() {
  const [firmwares, setFirmwares] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [selectedFirmware, setSelectedFirmware] = useState(null);

  // Form states
  const [version, setVersion] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [firmwareFile, setFirmwareFile] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [firmwareData, deviceData] = await Promise.all([
        getAllFirmware(token),
        getDevices(token),
      ]);
      setFirmwares(firmwareData.firmwares);
      setDevices(deviceData.devices);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".bin")) {
      setFirmwareFile(file);
    } else {
      alert("Chỉ chấp nhận file .bin");
      e.target.value = "";
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!firmwareFile || !version) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const formData = new FormData();
    formData.append("firmware", firmwareFile);
    formData.append("version", version);
    formData.append("releaseNotes", releaseNotes);

    try {
      setUploading(true);
      await uploadFirmware(formData, token);
      alert("Upload firmware thành công!");
      setShowUploadModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.response?.data?.message || "Lỗi khi upload firmware");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa firmware này?")) return;

    try {
      await deleteFirmware(id, token);
      alert("Xóa firmware thành công!");
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Lỗi khi xóa firmware");
    }
  };

  const handleTriggerUpdate = async (deviceId) => {
    if (!selectedFirmware) return;

    try {
      await triggerOTAUpdate(deviceId, selectedFirmware.version, token);
      alert(`Đã gửi lệnh OTA update tới device ${deviceId}`);
      setShowTriggerModal(false);
      setSelectedFirmware(null);
    } catch (error) {
      console.error("Trigger OTA error:", error);
      alert(error.response?.data?.message || "Lỗi khi trigger OTA update");
    }
  };

  const resetForm = () => {
    setVersion("");
    setReleaseNotes("");
    setFirmwareFile(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (loading) return <Loader />;

  return (
    <div className="ota-container">
      <div className="ota-header">
        <h1>🔄 OTA Firmware Management</h1>
        <button className="btn-upload" onClick={() => setShowUploadModal(true)}>
          ⬆️ Upload Firmware
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{firmwares.length}</div>
            <div className="stat-label">Firmware Versions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🆕</div>
          <div className="stat-content">
            <div className="stat-value">{firmwares[0]?.version || "N/A"}</div>
            <div className="stat-label">Latest Version</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <div className="stat-value">{devices.length}</div>
            <div className="stat-label">Total Devices</div>
          </div>
        </div>
      </div>

      {/* Firmware List */}
      <div className="firmware-table-container">
        <h2>📋 Firmware Versions</h2>
        {firmwares.length === 0 ? (
          <p className="empty-message">Chưa có firmware nào được upload</p>
        ) : (
          <table className="firmware-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>File Name</th>
                <th>Size</th>
                <th>Downloads</th>
                <th>Uploaded By</th>
                <th>Upload Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {firmwares.map((fw) => (
                <tr key={fw._id}>
                  <td>
                    <span className="version-badge">{fw.version}</span>
                  </td>
                  <td>{fw.filename}</td>
                  <td>{formatFileSize(fw.fileSize)}</td>
                  <td>{fw.downloadCount}</td>
                  <td>{fw.uploadedBy}</td>
                  <td>{formatDate(fw.createdAt)}</td>
                  <td>
                    <button
                      className="btn-trigger"
                      onClick={() => {
                        setSelectedFirmware(fw);
                        setShowTriggerModal(true);
                      }}
                    >
                      🚀 Trigger OTA
                    </button>
                    <button
                      className="btn-delete-small"
                      onClick={() => handleDelete(fw._id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⬆️ Upload Firmware</h2>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>
                ✖
              </button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>Version *</label>
                <input
                  type="text"
                  placeholder="e.g. 1.0.0"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Firmware File (.bin) *</label>
                <input
                  type="file"
                  accept=".bin"
                  onChange={handleFileChange}
                  required
                />
                {firmwareFile && (
                  <p className="file-info">
                    📄 {firmwareFile.name} ({formatFileSize(firmwareFile.size)})
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Release Notes</label>
                <textarea
                  rows="4"
                  placeholder="Mô tả các thay đổi trong phiên bản này..."
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowUploadModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={uploading}>
                  {uploading ? "Đang upload..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trigger OTA Modal */}
      {showTriggerModal && selectedFirmware && (
        <div className="modal-overlay" onClick={() => setShowTriggerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🚀 Trigger OTA Update</h2>
              <button className="modal-close" onClick={() => setShowTriggerModal(false)}>
                ✖
              </button>
            </div>
            <div className="trigger-info">
              <p>
                <strong>Firmware Version:</strong> {selectedFirmware.version}
              </p>
              <p>
                <strong>File Size:</strong> {formatFileSize(selectedFirmware.fileSize)}
              </p>
              <p className="trigger-description">
                Chọn thiết bị cần cập nhật firmware:
              </p>
            </div>

            <div className="device-list">
              {devices.length === 0 ? (
                <p className="empty-message">Không có device nào</p>
              ) : (
                devices.map((device) => (
                  <div key={device._id} className="device-item">
                    <div className="device-info">
                      <strong>{device.name}</strong>
                      <span className="device-id">ID: {device.deviceId}</span>
                      <span className="device-location">📍 {device.location}</span>
                    </div>
                    <button
                      className="btn-update"
                      onClick={() => handleTriggerUpdate(device.deviceId)}
                    >
                      Update
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowTriggerModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
