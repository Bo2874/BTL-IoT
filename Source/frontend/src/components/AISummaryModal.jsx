import { useEffect, useState } from 'react';
import { getSummaries } from '../api/summaries';

export default function AISummaryModal({ isOpen, onClose }) {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadSummaries();
    }
  }, [isOpen]);

  const loadSummaries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSummaries(24); // Lấy 24 giờ gần nhất
      setSummaries(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading summaries:', err);
      setError('Không thể tải dữ liệu tóm tắt');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            🤖 AI Summary - Tóm Tắt Theo Giờ
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="text-center py-8">
              <div className="loader"></div>
              <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {!loading && !error && summaries.length === 0 && (
            <div className="empty-message">
              📭 Chưa có dữ liệu tóm tắt nào.
              <br />
              <small>Hệ thống tự động tạo tóm tắt mỗi giờ.</small>
            </div>
          )}

          {!loading && !error && summaries.length > 0 && (
            <div className="summaries-list">
              {summaries.map((summary) => (
                <div key={summary._id} className="summary-card">
                  <div className="summary-header">
                    <span className="summary-time">
                      🕐 {new Date(summary.hourTimestamp).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="summary-samples">
                      📊 {summary.sampleCount} mẫu
                    </span>
                  </div>

                  <div className="summary-stats">
                    <div className="stat-item">
                      <span className="stat-label">🌡️ Nhiệt độ:</span>
                      <span className="stat-value">
                        {summary.statistics.temperature.min.toFixed(1)}°C - {summary.statistics.temperature.max.toFixed(1)}°C 
                        (TB: {summary.statistics.temperature.avg.toFixed(1)}°C)
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">💧 Độ ẩm:</span>
                      <span className="stat-value">
                        {summary.statistics.humidity.min.toFixed(1)}% - {summary.statistics.humidity.max.toFixed(1)}%
                        (TB: {summary.statistics.humidity.avg.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">🌫️ AQI:</span>
                      <span className="stat-value">
                        {summary.statistics.aqi.min} - {summary.statistics.aqi.max}
                        (TB: {Math.round(summary.statistics.aqi.avg)})
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">💨 PM2.5:</span>
                      <span className="stat-value">
                        {summary.statistics.pm25.min.toFixed(1)} - {summary.statistics.pm25.max.toFixed(1)} µg/m³
                        (TB: {summary.statistics.pm25.avg.toFixed(1)} µg/m³)
                      </span>
                    </div>
                  </div>

                  <div className="summary-ai-text">
                    {summary.aiSummary}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-refresh" onClick={loadSummaries}>
            🔄 Làm mới
          </button>
          <button className="btn-close" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
