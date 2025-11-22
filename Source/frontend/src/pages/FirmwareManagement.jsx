import { useState, useEffect } from "react";
import { getAllFirmware, uploadFirmware, deleteFirmware, triggerOTAUpdate } from "../api/firmware";
import Loader from "../components/Loader";
import "../styles/global.css";

const FirmwareManagement = () => {
  const [firmwares, setFirmwares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [otaLoading, setOtaLoading] = useState({});
  
  // Form states
  const [selectedFile, setSelectedFile] = useState(null);
  const [version, setVersion] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [deviceId, setDeviceId] = useState("67890abcde12345fghij"); // Default device ID
  
  const token = localStorage.getItem("token"); // Get auth token

  useEffect(() => {
    fetchFirmwares();
  }, []);

  const fetchFirmwares = async () => {
    try {
      setLoading(true);
      const data = await getAllFirmware(token);
      setFirmwares(data.firmwares || []);
    } catch (error) {
      console.error("Error fetching firmwares:", error);
      alert("Không thể tải danh sách firmware. Vui lòng đăng nhập lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.name.endsWith(".bin")) {
      alert("Chỉ chấp nhận file .bin");
      e.target.value = null;
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile || !version) {
      alert("Vui lòng chọn file và nhập version");
      return;
    }

    const formData = new FormData();
    formData.append("firmware", selectedFile);
    formData.append("version", version);
    formData.append("releaseNotes", releaseNotes);

    try {
      setUploadLoading(true);
      await uploadFirmware(formData, token);
      alert("Upload firmware thành công!");
      
      // Reset form
      setSelectedFile(null);
      setVersion("");
      setReleaseNotes("");
      document.getElementById("fileInput").value = null;
      
      // Refresh list
      fetchFirmwares();
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.response?.data?.message || "Lỗi khi upload firmware");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id, version) => {
    if (!confirm(`Xóa firmware version ${version}?`)) return;

    try {
      await deleteFirmware(id, token);
      alert("Xóa firmware thành công!");
      fetchFirmwares();
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "Lỗi khi xóa firmware");
    }
  };

  const handleTriggerOTA = async (firmwareVersion) => {
    if (!deviceId) {
      alert("Vui lòng nhập Device ID");
      return;
    }

    if (!confirm(`Gửi lệnh OTA update version ${firmwareVersion} tới device ${deviceId}?`)) return;

    try {
      setOtaLoading({ ...otaLoading, [firmwareVersion]: true });
      await triggerOTAUpdate(deviceId, firmwareVersion, token);
      alert(`Đã gửi lệnh OTA update tới device ${deviceId}!\nKiểm tra Serial Monitor của ESP32.`);
    } catch (error) {
      console.error("OTA trigger error:", error);
      alert(error.response?.data?.message || "Lỗi khi trigger OTA update");
    } finally {
      setOtaLoading({ ...otaLoading, [firmwareVersion]: false });
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading) return <Loader />;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🔧 Quản lý Firmware OTA</h1>

      {/* Upload Form */}
      <div style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "30px"
      }}>
        <h2>📤 Upload Firmware Mới</h2>
        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              File .bin:
            </label>
            <input
              id="fileInput"
              type="file"
              accept=".bin"
              onChange={handleFileChange}
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                width: "100%"
              }}
            />
            {selectedFile && (
              <small style={{ color: "#666" }}>
                File: {selectedFile.name} ({formatBytes(selectedFile.size)})
              </small>
            )}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Version (vd: 1.0.0):
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                width: "100%"
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Release Notes (optional):
            </label>
            <textarea
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              placeholder="Mô tả những thay đổi trong version này..."
              rows="3"
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                width: "100%"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={uploadLoading}
            style={{
              background: uploadLoading ? "#ccc" : "#4CAF50",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: uploadLoading ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            {uploadLoading ? "Đang upload..." : "Upload Firmware"}
          </button>
        </form>
      </div>

      {/* Device ID Input */}
      <div style={{
        background: "#fff",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "30px"
      }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Device ID (để trigger OTA):
        </label>
        <input
          type="text"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          placeholder="67890abcde12345fghij"
          style={{
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            width: "100%"
          }}
        />
      </div>

      {/* Firmware List */}
      <div style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h2>📦 Danh sách Firmware ({firmwares.length})</h2>
        
        {firmwares.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>
            Chưa có firmware nào được upload
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Version</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>File</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Size</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>MD5</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Downloads</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Uploaded</th>
                <th style={{ padding: "10px", textAlign: "center", borderBottom: "2px solid #ddd" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {firmwares.map((fw) => (
                <tr key={fw._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>
                    <strong>{fw.version}</strong>
                    {fw.isActive && (
                      <span style={{
                        marginLeft: "8px",
                        padding: "2px 8px",
                        background: "#4CAF50",
                        color: "white",
                        borderRadius: "4px",
                        fontSize: "12px"
                      }}>
                        Active
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "10px", fontSize: "12px" }}>{fw.filename}</td>
                  <td style={{ padding: "10px" }}>{formatBytes(fw.fileSize)}</td>
                  <td style={{ padding: "10px", fontSize: "11px", fontFamily: "monospace" }}>
                    {fw.md5Hash.substring(0, 12)}...
                  </td>
                  <td style={{ padding: "10px" }}>{fw.downloadCount}</td>
                  <td style={{ padding: "10px", fontSize: "12px" }}>
                    {new Date(fw.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <button
                      onClick={() => handleTriggerOTA(fw.version)}
                      disabled={otaLoading[fw.version]}
                      style={{
                        background: otaLoading[fw.version] ? "#ccc" : "#2196F3",
                        color: "white",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: otaLoading[fw.version] ? "not-allowed" : "pointer",
                        marginRight: "5px",
                        fontSize: "12px"
                      }}
                    >
                      {otaLoading[fw.version] ? "⏳" : "🚀 OTA"}
                    </button>
                    <button
                      onClick={() => handleDelete(fw._id, fw.version)}
                      style={{
                        background: "#f44336",
                        color: "white",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {firmwares.length > 0 && firmwares[0].releaseNotes && (
          <div style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f9f9f9",
            borderRadius: "4px",
            borderLeft: "4px solid #2196F3"
          }}>
            <strong>Release Notes (Latest):</strong>
            <p style={{ marginTop: "8px", color: "#666" }}>
              {firmwares[0].releaseNotes || "No release notes"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirmwareManagement;
