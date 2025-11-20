import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRealtime, getHistory } from '../api/sensors';
import { API_URL } from '../config';
import { io } from 'socket.io-client';
import SensorChart from '../components/SensorChart';
import Loader from '../components/Loader';
import AISummaryModal from '../components/AISummaryModal';
import { Bar, Doughnut } from 'react-chartjs-2';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [realtime, setRealtime] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAISummary, setShowAISummary] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 5000); // fallback polling

    // Realtime via Socket.IO
    const SOCKET_URL = API_URL.replace(/\/api$/, '');
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => console.log('🔌 socket connected'));
    socket.on('sensor:update', (payload) => {
      // Update realtime
      setRealtime({
        aqi: payload.aqi,
        temperature: payload.temperature,
        humidity: payload.humidity,
        pm25: payload.pm25,
        time: payload.time,
        createdAt: payload.createdAt
      });
      // Append to history for charts
      setHistory((prev) => {
        if (!prev) return prev;
        const updated = [...prev, {
          aqi: payload.aqi,
          temperature: payload.temperature,
          humidity: payload.humidity,
          pm25: payload.pm25,
          createdAt: payload.createdAt,
          time: payload.time
        }];
        // Limit to 100 items to keep charts light
        if (updated.length > 100) updated.shift();
        return updated;
      });
    });

    return () => { clearInterval(interval); socket.close(); };
  }, []);

  const loadAll = async () => {
    try {
      const [realtimeData, historyData] = await Promise.all([
        getRealtime(),
        getHistory(50)
      ]);
      setRealtime(realtimeData);
      setHistory(historyData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!realtime || !history) return <div className='p-6 text-center text-red-500'>Không thể tải dữ liệu</div>;

  const chartData = [...history].reverse();
  const avgTemp = (chartData.reduce((sum, item) => sum + item.temperature, 0) / chartData.length).toFixed(1);
  const avgHumidity = (chartData.reduce((sum, item) => sum + item.humidity, 0) / chartData.length).toFixed(1);
  const avgAQI = Math.round(chartData.reduce((sum, item) => sum + item.aqi, 0) / chartData.length);
  const avgPM25 = (chartData.reduce((sum, item) => sum + item.pm25, 0) / chartData.length).toFixed(1);
  const last4Samples = chartData.slice(-4);

  const temperatureBarData = {
    labels: ['3h trước', '2h trước', '1h trước', 'Hiện tại'],
    datasets: [{
      label: 'Nhiệt độ (°C)',
      data: last4Samples.map(item => item.temperature),
      backgroundColor: ['#3b82f6', '#3b82f6', '#3b82f6', '#ef4444'],
      borderWidth: 0,
    }]
  };

  const humidityBarData = {
    labels: ['3h trước', '2h trước', '1h trước', 'Hiện tại'],
    datasets: [{
      label: 'Độ ẩm (%)',
      data: last4Samples.map(item => item.humidity),
      backgroundColor: ['#10b981', '#10b981', '#10b981', '#14b8a6'],
      borderWidth: 0,
    }]
  };

  const getAQIDistribution = () => {
    const good = chartData.filter(item => item.aqi <= 50).length;
    const moderate = chartData.filter(item => item.aqi > 50 && item.aqi <= 100).length;
    const unhealthy = chartData.filter(item => item.aqi > 100).length;
    const total = chartData.length;
    
    return {
      labels: [
        `Tốt (${((good/total)*100).toFixed(0)}%)`, 
        `TB (${((moderate/total)*100).toFixed(0)}%)`, 
        `Kém (${((unhealthy/total)*100).toFixed(0)}%)`
      ],
      datasets: [{
        data: [good, moderate, unhealthy],
        backgroundColor: ['#4CAF50', '#FFEB3B', '#F44336'],
        borderWidth: 3,
        borderColor: '#fff'
      }]
    };
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { size: 12, weight: 'bold' } }
      },
      x: { 
        grid: { display: false },
        ticks: { font: { size: 11, weight: 'bold' } }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 12, weight: 'bold' }, padding: 10 }
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: 12 }} className="container-max">
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3 rounded-lg mb-3 shadow-lg flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <span className='text-2xl'>🌍</span>
          <div>
            <h1 className='text-xl font-bold'>IOT AIR QUALITY SYSTEM - Dashboard</h1>
            <p className='text-xs opacity-90'>Real-time Environmental Monitoring</p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          {/* User Info */}
          <div className='text-right text-xs border-r border-white/30 pr-3'>
            <p className='font-semibold'>{user?.name || 'User'}</p>
            <p className='opacity-80'>{user?.role || 'Worker'}</p>
          </div>
          
          <button 
            onClick={() => setShowAISummary(true)}
            className='ai-summary-btn'
            title='Xem tóm tắt AI theo giờ'
          >
            🤖 AI Summary
          </button>
          
          {user?.role === 'Admin' && (
            <>
              <button
                onClick={() => navigate('/admin')}
                className='admin-btn'
                title='Quản lý thiết bị'
              >
                🛠️ Thiết bị
              </button>
              <button
                onClick={() => navigate('/users')}
                className='admin-btn'
                title='Quản lý người dùng'
                style={{ marginLeft: '0.5rem' }}
              >
                👥 Người dùng
              </button>
              <button
                onClick={() => navigate('/ota')}
                className='admin-btn'
                title='OTA Firmware Update'
                style={{ marginLeft: '0.5rem' }}
              >
                🔄 OTA
              </button>
            </>
          )}
          
          <button
            onClick={handleLogout}
            className='logout-btn'
            title='Đăng xuất'
          >
            🚪 Logout
          </button>
          
          <div className='text-right text-xs'>
            <p>{new Date().toLocaleString('vi-VN')}</p>
          </div>
        </div>
      </div>

      {/* Summary Row - Table-like (no Tailwind) */}
      <div className="summary-row-wrapper">
        <div className="summary-row">
          <div className="summary-grid">
            {/* Temperature */}
            <div className="summary-cell">
              <div className="summary-label">Nhiệt độ</div>
              <div>
                <span className="summary-value t-blue">{realtime.temperature.toFixed(1)}</span>
                <span className="summary-unit">°C</span>
              </div>
            </div>

            {/* Humidity */}
            <div className="summary-cell">
              <div className="summary-label">Độ ẩm</div>
              <div>
                <span className="summary-value t-green">{realtime.humidity.toFixed(1)}</span>
                <span className="summary-unit">%</span>
              </div>
            </div>

            {/* AQI */}
            <div className="summary-cell">
              <div className="summary-label">AQI</div>
              <div>
                <span className="summary-value t-orange">{Math.round(realtime.aqi)}</span>
                <span className="summary-unit">Index</span>
              </div>
            </div>

            {/* PM2.5 */}
            <div className="summary-cell">
              <div className="summary-label">PM2.5</div>
              <div>
                <span className="summary-value t-red">{realtime.pm25.toFixed(1)}</span>
                <span className="summary-unit">µg/m³</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section - Bar Charts & Doughnut */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3'>
        <div className='bg-white p-3 rounded-lg shadow-md border border-gray-200'>
          <h3 className='text-sm font-bold text-white mb-2 bg-blue-500 p-2 rounded text-center'>
            Nhiệt độ (°C)
          </h3>
          <div style={{ height: '200px' }}>
            <Bar data={temperatureBarData} options={barOptions} />
          </div>
        </div>

        <div className='bg-white p-3 rounded-lg shadow-md border border-gray-200'>
          <h3 className='text-sm font-bold text-white mb-2 bg-green-500 p-2 rounded text-center'>
            Độ ẩm (%)
          </h3>
          <div style={{ height: '200px' }}>
            <Bar data={humidityBarData} options={barOptions} />
          </div>
        </div>

        <div className='bg-white p-3 rounded-lg shadow-md border border-gray-200'>
          <h3 className='text-sm font-bold text-white mb-2 bg-orange-500 p-2 rounded text-center'>
            Phân bố chất lượng KK
          </h3>
          <div style={{ height: '200px' }} className='flex items-center justify-center'>
            <Doughnut data={getAQIDistribution()} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Line Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3'>
        <div className='bg-white p-3 rounded-lg shadow-md border border-gray-200'>
          <h3 className='text-sm font-bold text-white mb-2 bg-blue-500 p-2 rounded text-center'>
            Nhiệt độ theo thời gian
          </h3>
          <div style={{ height: '220px' }}>
            <SensorChart
              label='Nhiệt độ (°C)'
              data={chartData.map(item => ({
                time: new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                value: item.temperature
              }))}
              borderColor='rgb(59, 130, 246)'
              backgroundColor='rgba(59, 130, 246, 0.1)'
            />
          </div>
        </div>

        <div className='bg-white p-3 rounded-lg shadow-md border border-gray-200'>
          <h3 className='text-sm font-bold text-white mb-2 bg-orange-500 p-2 rounded text-center'>
            AQI theo thời gian
          </h3>
          <div style={{ height: '220px' }}>
            <SensorChart
              label='AQI'
              data={chartData.map(item => ({
                time: new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                value: item.aqi
              }))}
              borderColor='rgb(249, 115, 22)'
              backgroundColor='rgba(249, 115, 22, 0.1)'
            />
          </div>
        </div>
      </div>

      {/* Gauges Section */}
      <div className='bg-white rounded-lg shadow-md border border-gray-200 p-3'>
        <h3 className='text-sm font-bold text-white mb-3 bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded text-center'>
          Giá trị trung bình (50 mẫu)
        </h3>
        <div className="gauges-row-wrapper">
          <div className="gauges-row">
            <div className="gauges-grid">
          <div className='gauge-cell'>
            <div className='relative w-24 h-24 mx-auto mb-2'>
              <svg className='w-full h-full transform -rotate-90'>
                <circle cx='48' cy='48' r='40' fill='none' stroke='#e5e7eb' strokeWidth='8'/>
                <circle 
                  cx='48' cy='48' r='40' 
                  fill='none' 
                  stroke='#3b82f6' 
                  strokeWidth='8'
                  strokeDasharray={`${(avgTemp / 50) * 251.33} 251.33`}
                  strokeLinecap='round'
                />
              </svg>
              <div className='absolute inset-0 flex items-center justify-center flex-col'>
                <span className='text-xl font-bold text-blue-600'>{avgTemp}</span>
                <span className='text-xs text-gray-500'>°C</span>
              </div>
            </div>
            <p className='font-bold text-xs text-gray-700 bg-blue-200 py-1 rounded'>Nhiệt độ TB</p>
          </div>

          <div className='gauge-cell'>
            <div className='relative w-24 h-24 mx-auto mb-2'>
              <svg className='w-full h-full transform -rotate-90'>
                <circle cx='48' cy='48' r='40' fill='none' stroke='#e5e7eb' strokeWidth='8'/>
                <circle 
                  cx='48' cy='48' r='40' 
                  fill='none' 
                  stroke='#10b981' 
                  strokeWidth='8'
                  strokeDasharray={`${(avgHumidity / 100) * 251.33} 251.33`}
                  strokeLinecap='round'
                />
              </svg>
              <div className='absolute inset-0 flex items-center justify-center flex-col'>
                <span className='text-xl font-bold text-green-600'>{avgHumidity}</span>
                <span className='text-xs text-gray-500'>%</span>
              </div>
            </div>
            <p className='font-bold text-xs text-gray-700 bg-green-200 py-1 rounded'>Độ ẩm TB</p>
          </div>

          <div className='gauge-cell'>
            <div className='relative w-24 h-24 mx-auto mb-2'>
              <svg className='w-full h-full transform -rotate-90'>
                <circle cx='48' cy='48' r='40' fill='none' stroke='#e5e7eb' strokeWidth='8'/>
                <circle 
                  cx='48' cy='48' r='40' 
                  fill='none' 
                  stroke='#f97316' 
                  strokeWidth='8'
                  strokeDasharray={`${(avgAQI / 500) * 251.33} 251.33`}
                  strokeLinecap='round'
                />
              </svg>
              <div className='absolute inset-0 flex items-center justify-center flex-col'>
                <span className='text-xl font-bold text-orange-600'>{avgAQI}</span>
                <span className='text-xs text-gray-500'>AQI</span>
              </div>
            </div>
            <p className='font-bold text-xs text-gray-700 bg-orange-200 py-1 rounded'>AQI TB</p>
          </div>

          <div className='gauge-cell'>
            <div className='relative w-24 h-24 mx-auto mb-2'>
              <svg className='w-full h-full transform -rotate-90'>
                <circle cx='48' cy='48' r='40' fill='none' stroke='#e5e7eb' strokeWidth='8'/>
                <circle 
                  cx='48' cy='48' r='40' 
                  fill='none' 
                  stroke='#ef4444' 
                  strokeWidth='8'
                  strokeDasharray={`${(avgPM25 / 500) * 251.33} 251.33`}
                  strokeLinecap='round'
                />
              </svg>
              <div className='absolute inset-0 flex items-center justify-center flex-col'>
                <span className='text-xl font-bold text-red-600'>{avgPM25}</span>
                <span className='text-xs text-gray-500'>µg/m³</span>
              </div>
            </div>
            <p className='font-bold text-xs text-gray-700 bg-red-200 py-1 rounded'>PM2.5 TB</p>
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary Modal */}
      <AISummaryModal 
        isOpen={showAISummary} 
        onClose={() => setShowAISummary(false)} 
      />
    </div>
  );
}
