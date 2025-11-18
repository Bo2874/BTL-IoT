# 🌍 IOT AIR QUALITY SYSTEM (BTL-IoT)

## 📋 Mô Tả Tổng Quan

Hệ thống giám sát chất lượng không khí thời gian thực sử dụng:
- **Thiết bị IoT**: ESP32 + cảm biến (DHT11, MQ135, GP2Y1010AU0F)
- **Truyền dữ liệu**: MQTT (HiveMQ Cloud)
- **Backend**: Node.js/Express + MongoDB
- **Frontend**: React/Vite với biểu đồ realtime
- **Cập nhật realtime**: Socket.IO

📅 **Ngày cập nhật**: 16/11/2025

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│  ESP32 (DHT11 + MQ135 + GP2Y1010)                          │
│  - Đọc nhiệt độ, độ ẩm                                      │
│  - Đọc AQI (MQ135)                                          │
│  - Đọc nồng độ bụi PM2.5 (GP2Y1010)                        │
└───────────────┬─────────────────────────────────────────────┘
                │ MQTT Publish (JSON)
                ▼
┌─────────────────────────────────────────────────────────────┐
│  MQTT Broker (HiveMQ Cloud)                                 │
│  Topic: home/room1/sensors                                  │
└───────────────┬─────────────────────────────────────────────┘
                │ Subscribe
                ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend (Node.js + Express)                                │
│  ├─ MQTT Client: nhận & validate dữ liệu                    │
│  ├─ MongoDB: lưu trữ lịch sử                                │
│  ├─ REST API: /api/sensors/*                                │
│  └─ Socket.IO: phát realtime event                          │
└───────────────┬─────────────────────────────────────────────┘
                │ HTTP + WebSocket
                ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                                    │
│  - Dashboard với biểu đồ realtime                           │
│  - Lịch sử dữ liệu                                          │
│  - Chart.js: Line, Bar, Doughnut                            │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Tính Năng Chính

### 📊 Dashboard Realtime
- Hiển thị dữ liệu mới nhất (nhiệt độ, độ ẩm, AQI, PM2.5)
- Cập nhật tự động qua Socket.IO
- Biểu đồ đường (Line): Nhiệt độ, AQI theo thời gian
- Biểu đồ cột (Bar): So sánh 4 mẫu gần nhất
- Biểu đồ tròn (Doughnut): Phân bố chất lượng không khí
- Gauge: Giá trị trung bình 50 mẫu

### 🤖 AI Summary (NEW!)
- **Tóm tắt thông minh theo giờ**: Hệ thống tự động tạo bản tóm tắt bằng AI (OpenAI GPT) mỗi giờ
- **Phân tích xu hướng**: Đánh giá tình trạng không khí, xu hướng biến đổi
- **Lời khuyên thực tế**: AI đưa ra khuyến nghị dựa trên dữ liệu
- **Giao diện thân thiện**: Nút "🤖 AI Summary" ở góc trên phải Dashboard
- **Xem lịch sử**: Modal hiển thị tóm tắt 24 giờ gần nhất với thống kê chi tiết

### 📈 Lịch Sử
- Xem lại dữ liệu đã lưu
- API hỗ trợ query với limit tùy chỉnh

### 🔄 Realtime Updates
- Socket.IO với event `sensor:update`
- Polling dự phòng mỗi 5 giây

### ✅ Validation & Error Handling
- Validate dữ liệu MQTT đầu vào
- Kiểm tra biên hợp lệ (nhiệt độ, độ ẩm, AQI, bụi)
- Log chi tiết trạng thái kết nối MQTT/MongoDB
- Global error handler

---

## 📁 Cấu Trúc Thư Mục

```
BTL-IoT/
├── README.md                           # Tài liệu này
├── Documents/                          # Tài liệu dự án
├── Arduino/
│   ├── BTL_IoT.ino                     # Code ESP32 (phiên bản cơ bản)
│   └── BTL_IoT/
│       └── BTL_IoT.ino                 # Code ESP32 (có trung bình MQ135)
└── Source/
    ├── backend/
    │   ├── package.json
    │   └── src/
    │       ├── server.js               # Khởi tạo Express, MongoDB, Socket.IO, Scheduled Jobs
    │       ├── config/
    │       │   └── mqttConfig.js       # Cấu hình MQTT broker
    │       ├── controllers/
    │       │   ├── sensorController.js # Logic xử lý API sensors
    │       │   └── summaryController.js # Logic xử lý AI summaries
    │       ├── models/
    │       │   ├── sensorData.js       # Schema MongoDB cho sensor data
    │       │   └── hourlySummary.js    # Schema MongoDB cho AI summaries
    │       ├── services/
    │       │   └── openaiService.js    # Tích hợp OpenAI API
    │       ├── jobs/
    │       │   └── scheduledJobs.js    # Cron job tự động tạo summary
    │       ├── mqtt/
    │       │   └── mqttClient.js       # MQTT client, parse & emit
    │       ├── realtime/
    │       │   └── socket.js           # Socket.IO setup
    │       └── routes/
    │           ├── sensorRoutes.js     # Định nghĩa API routes sensors
    │           └── summaryRoutes.js    # Định nghĩa API routes summaries
    └── frontend/
        ├── index.html
        ├── package.json
        ├── vite.config.js              # Vite config (port 5173, proxy)
        └── src/
            ├── App.jsx                 # Router chính
            ├── main.jsx                # Entry point
            ├── config.js               # API_URL
            ├── api/
            │   ├── sensors.js          # API calls sensors
            │   └── summaries.js        # API calls summaries
            ├── components/
            │   ├── AQIBadge.jsx
            │   ├── AISummaryModal.jsx  # Modal hiển thị AI summaries
            │   ├── Loader.jsx
            │   ├── RealtimeCard.jsx
            │   └── SensorChart.jsx     # Biểu đồ Line Chart
            ├── hooks/
            │   └── useFetch.js
            ├── pages/
            │   ├── Dashboard.jsx       # Trang chính (có nút AI Summary)
            │   └── History.jsx         # Trang lịch sử
            ├── styles/
            │   └── global.css          # CSS tùy chỉnh
            └── utils/
                ├── aqiColor.js
                └── formatDate.js
```

---

## 🛠️ Yêu Cầu Hệ Thống

- **Node.js**: >= 18.x
- **npm**: >= 8.x
- **MongoDB**: Cloud (MongoDB Atlas) hoặc local
- **MQTT Broker**: HiveMQ Cloud hoặc tương tự
- **Arduino IDE**: Cho lập trình ESP32 (tùy chọn)

---

## ⚙️ Cài Đặt & Chạy

### 1️⃣ Backend

```powershell
# Di chuyển đến thư mục backend
cd c:\BTL-IoT\Source\backend

# Cài đặt dependencies
npm install

# Tạo file .env (xem phần Biến Môi Trường bên dưới)
# notepad .env

# Chạy development mode
npm run dev

# Hoặc chạy production
npm start
```

**Backend sẽ chạy tại**: `http://localhost:5000`

### 2️⃣ Frontend

```powershell
# Mở terminal mới, di chuyển đến thư mục frontend
cd c:\BTL-IoT\Source\frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

**Frontend sẽ chạy tại**: `http://localhost:5173`

### 3️⃣ Truy Cập Ứng Dụng

Mở trình duyệt và truy cập: **http://localhost:5173**

---

## 🔐 Biến Môi Trường

Tạo file `.env` trong thư mục `Source/backend/`:

```env
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=development
BACKEND_URL=http://localhost:5000

# CORS
FRONTEND_ORIGIN=http://localhost:5173

# OpenAI API (cho AI Summary)
OPENAI_API_KEY=sk-your-openai-api-key-here

# MQTT Configuration
MQTT_BROKER_URL=mqtts://your-cluster.s1.eu.hivemq.cloud
MQTT_PORT=8883
MQTT_USERNAME=esp32-air-system
MQTT_PASSWORD=YourStrongPassword123
MQTT_TOPIC=home/room1/sensors
```

### 📝 Giải Thích Biến

| Biến | Mô Tả | Mặc Định |
|------|-------|----------|
| `MONGO_URI` | Connection string MongoDB | **Bắt buộc** |
| `PORT` | Port chạy backend | `5000` |
| `NODE_ENV` | Môi trường (development/production) | `development` |
| `BACKEND_URL` | URL backend (cho scheduled jobs) | `http://localhost:5000` |
| `FRONTEND_ORIGIN` | URL frontend cho CORS | `*` |
| `OPENAI_API_KEY` | API key của OpenAI (cho AI Summary) | **Bắt buộc cho AI** |
| `MQTT_BROKER_URL` | URL MQTT broker | Xem config |
| `MQTT_PORT` | Port MQTT (TLS: 8883) | `8883` |
| `MQTT_USERNAME` | Username MQTT | Xem config |
| `MQTT_PASSWORD` | Password MQTT | Xem config |
| `MQTT_TOPIC` | Topic subscribe | `home/room1/sensors` |

---

## 🌐 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Lấy Tất Cả Dữ Liệu (50 bản ghi mới nhất)
```http
GET /api/sensors
```

**Response:**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "_id": "...",
      "datetime": "2025-11-16 12:34:56",
      "temperature": 29.3,
      "humidity": 61.5,
      "AQI": 85,
      "dust": 35.2,
      "createdAt": "2025-11-16T05:34:56.789Z"
    }
  ]
}
```

#### 2. Lấy Dữ Liệu Realtime (mới nhất)
```http
GET /api/sensors/realtime
```

**Response:**
```json
{
  "aqi": 85,
  "temperature": 29.3,
  "humidity": 61.5,
  "pm25": 35.2,
  "time": "2025-11-16 12:34:56",
  "createdAt": "2025-11-16T05:34:56.789Z"
}
```

#### 3. Lấy Lịch Sử
```http
GET /api/sensors/history?limit=100
```

**Query Parameters:**
- `limit` (optional): Số lượng bản ghi (mặc định: 50)

**Response:**
```json
[
  {
    "aqi": 85,
    "temperature": 29.3,
    "humidity": 61.5,
    "pm25": 35.2,
    "time": "2025-11-16 12:34:56",
    "createdAt": "2025-11-16T05:34:56.789Z"
  }
]
```

#### 4. Tạo AI Summary Cho 1 Giờ 🤖
```http
POST /api/summaries
Content-Type: application/json
```

**Request Body:**
```json
{
  "hourTimestamp": "2025-11-16T05:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo summary thành công",
  "data": {
    "_id": "...",
    "hourTimestamp": "2025-11-16T05:00:00.000Z",
    "sampleCount": 120,
    "statistics": {
      "temperature": { "min": 26.5, "max": 30.2, "avg": 28.3 },
      "humidity": { "min": 58.0, "max": 65.0, "avg": 61.5 },
      "aqi": { "min": 75, "max": 95, "avg": 85 },
      "pm25": { "min": 30.0, "max": 40.0, "avg": 35.2 }
    },
    "aiSummary": "📊 Tóm tắt 1 giờ qua...",
    "createdAt": "2025-11-16T06:05:00.000Z"
  }
}
```

#### 5. Lấy Danh Sách AI Summaries
```http
GET /api/summaries?limit=24
```

**Query Parameters:**
- `limit` (optional): Số lượng summaries (mặc định: 24)

**Response:**
```json
{
  "success": true,
  "count": 24,
  "data": [
    {
      "_id": "...",
      "hourTimestamp": "2025-11-16T05:00:00.000Z",
      "sampleCount": 120,
      "statistics": { ... },
      "aiSummary": "📊 Tóm tắt...",
      "createdAt": "2025-11-16T06:05:00.000Z"
    }
  ]
}
```

#### 6. Lấy AI Summary Cho 1 Giờ Cụ Thể
```http
GET /api/summaries/:hourTimestamp
```

**Example:**
```http
GET /api/summaries/2025-11-16T05:00:00.000Z
```

---

## 🔌 Socket.IO Events

### Connection
```javascript
const socket = io('http://localhost:5000');
```

### Event: `sensor:update`

**Payload:**
```json
{
  "aqi": 85,
  "temperature": 29.3,
  "humidity": 61.5,
  "pm25": 35.2,
  "time": "2025-11-16 12:34:56",
  "createdAt": "2025-11-16T05:34:56.789Z"
}
```

**Frontend Usage:**
```javascript
socket.on('sensor:update', (data) => {
  console.log('New sensor data:', data);
  // Cập nhật UI
});
```

---

## 📊 MongoDB Schema

### Collection: `sensordatas`

```javascript
{
  datetime: String,           // "2025-11-16 12:34:56"
  temperature: Number,        // -50 đến 100 (°C)
  humidity: Number,           // 0 đến 100 (%)
  AQI: Number,                // 0 đến 500
  dust: Number,               // >= 0 (µg/m³)
  createdAt: Date             // Auto-generated (indexed)
}
```

### Validation Rules
- `temperature`: -50°C ≤ T ≤ 100°C
- `humidity`: 0% ≤ H ≤ 100%
- `AQI`: 0 ≤ AQI ≤ 500
- `dust`: ≥ 0 µg/m³

---

## 📡 MQTT Message Format

### Topic
```
home/room1/sensors
```

### Message (JSON)
```json
{
  "datetime": "2025-11-16 12:34:56",
  "temperature": 29.3,
  "humidity": 61.5,
  "AQI": 85,
  "dust": 35.2
}
```

### Validation
- Backend tự động validate trước khi lưu
- Nếu dữ liệu không hợp lệ → log warning và bỏ qua

---

## 🤖 Arduino/ESP32

### Cảm Biến Sử Dụng

| Cảm Biến | Chức Năng | Pin |
|----------|-----------|-----|
| DHT11 | Nhiệt độ, độ ẩm | GPIO 15 |
| MQ135 | Chất lượng không khí (AQI) | GPIO 32 (AO), 33 (DO) |
| GP2Y1010AU0F | Nồng độ bụi PM2.5 | GPIO 4 (LED), 35 (AO) |

### Code Tham Khảo

Xem `Arduino/BTL_IoT/BTL_IoT.ino` để:
- Đọc cảm biến DHT11
- Đọc MQ135 với trung bình di động
- Đọc GP2Y1010AU0F với timing chính xác
- Tính toán AQI và nồng độ bụi

### Tích Hợp MQTT

Để gửi dữ liệu lên backend, cần thêm:

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YourWiFiSSID";
const char* password = "YourWiFiPassword";

// MQTT settings
const char* mqtt_server = "your-cluster.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "esp32-air-system";
const char* mqtt_pass = "YourPassword";
const char* mqtt_topic = "home/room1/sensors";

WiFiClientSecure espClient;
PubSubClient client(espClient);

void setup() {
  // ... khởi tạo cảm biến ...
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  
  espClient.setInsecure(); // Hoặc load certificate
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Đọc cảm biến
  float temp = ...; 
  float humid = ...;
  int aqi = ...;
  float dust = ...;
  
  // Tạo JSON
  StaticJsonDocument<256> doc;
  doc["datetime"] = getDateTime(); // Implement hàm này
  doc["temperature"] = temp;
  doc["humidity"] = humid;
  doc["AQI"] = aqi;
  doc["dust"] = dust;
  
  char buffer[256];
  serializeJson(doc, buffer);
  
  // Publish
  client.publish(mqtt_topic, buffer);
  
  delay(2000);
}
```

---

## 📦 Dependencies

### Backend (`Source/backend/package.json`)

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.2",
    "mqtt": "^4.3.7",
    "mongoose": "^7.0.0",
    "node-cron": "^3.0.3",
    "socket.io": "^4.7.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

### Frontend (`Source/frontend/package.json`)

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "chart.js": "^4.4.0",
    "react": "^18.3.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "socket.io-client": "^4.8.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.1",
    "vite": "^5.0.0"
  }
}
```

---

## 🐛 Khắc Phục Sự Cố

### 1. Backend không kết nối MongoDB
```
❌ MongoDB connection error
```

**Giải pháp:**
- Kiểm tra `MONGO_URI` trong `.env`
- Đảm bảo whitelist IP trong MongoDB Atlas
- Kiểm tra username/password
- Test connection string bằng MongoDB Compass

### 2. MQTT không nhận dữ liệu
```
⚠️ MQTT client is offline
```

**Giải pháp:**
- Kiểm tra `MQTT_BROKER_URL`, `MQTT_PORT`
- Xác nhận `MQTT_USERNAME` và `MQTT_PASSWORD`
- Kiểm tra topic đúng chưa
- Test bằng MQTT client (MQTT Explorer, mqttx)

### 3. OpenAI API không hoạt động (AI Summary)
```
❌ OpenAI API Error
```

**Giải pháp:**
- Kiểm tra `OPENAI_API_KEY` trong `.env`
- Đảm bảo API key còn hạn và có credit
- Kiểm tra kết nối internet
- Xem log chi tiết trong console
- Hệ thống sẽ tự động dùng fallback summary nếu API lỗi

### 4. Socket.IO không kết nối
```
🔌 Socket disconnected
```

**Giải pháp:**
- Kiểm tra `FRONTEND_ORIGIN` trong `.env`
- Đảm bảo backend đang chạy
- Kiểm tra firewall/antivirus
- Xem Console trong DevTools

### 5. Frontend không gọi được API
```
Network Error / CORS Error
```

**Giải pháp:**
- Kiểm tra proxy trong `vite.config.js`
- Đảm bảo backend chạy ở port 5000
- Kiểm tra `API_URL` trong `src/config.js`
- Clear cache và restart dev server

### 6. Dữ liệu không hợp lệ
```
⚠️ Invalid data format
```

**Giải pháp:**
- Kiểm tra format JSON từ MQTT
- Đảm bảo tất cả field bắt buộc có mặt
- Kiểm tra giá trị trong biên hợp lệ
- Xem log trong `mqttClient.js`

---

## 🚀 Production Deployment

### Build Frontend

```powershell
cd c:\BTL-IoT\Source\frontend
npm run build
```

Output: `dist/` folder → deploy lên hosting tĩnh (Vercel, Netlify, etc.)

### Backend Production

1. **Sử dụng PM2:**
```bash
npm install -g pm2
pm2 start src/server.js --name btl-iot-backend
pm2 save
pm2 startup
```

2. **Docker (optional):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
```

3. **Biến môi trường:**
- Đặt `NODE_ENV=production`
- Cập nhật `FRONTEND_ORIGIN` với URL production
- Sử dụng MongoDB Atlas (cloud)
- Bật TLS cho MQTT

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

---

## 📝 Scripts Hữu Ích

### Backend

```json
{
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "test-publish": "node publish_test.js"
}
```

### Frontend

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

---

## 🤖 Hướng Dẫn Sử Dụng AI Summary

### Giới Thiệu

Tính năng AI Summary sử dụng OpenAI GPT-3.5 để tạo bản tóm tắt thông minh về chất lượng không khí theo từng giờ. Hệ thống tự động:
1. Thu thập dữ liệu trong 1 giờ
2. Tính toán thống kê (min, max, avg)
3. Gửi đến OpenAI API để tạo tóm tắt bằng tiếng Việt
4. Lưu vào MongoDB
5. Hiển thị trong giao diện

### Cách Sử Dụng

#### 1. Cấu Hình OpenAI API Key

Lấy API key từ [OpenAI Platform](https://platform.openai.com/api-keys) và thêm vào `.env`:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

#### 2. Xem AI Summary

- Mở Dashboard: `http://localhost:5173`
- Click nút **🤖 AI Summary** ở góc trên bên phải
- Modal sẽ hiển thị danh sách tóm tắt 24 giờ gần nhất
- Mỗi card hiển thị:
  - 🕐 Thời gian (giờ được tóm tắt)
  - 📊 Số lượng mẫu
  - 🌡️💧🌫️💨 Thống kê chi tiết
  - 📝 Bản tóm tắt AI bằng tiếng Việt

#### 3. Tạo Summary Thủ Công (Optional)

Sử dụng API để tạo summary cho giờ cụ thể:

```bash
curl -X POST http://localhost:5000/api/summaries \
  -H "Content-Type: application/json" \
  -d '{"hourTimestamp": "2025-11-16T10:00:00.000Z"}'
```

#### 4. Scheduled Job

Backend tự động chạy job mỗi giờ (phút thứ 5) để tạo summary cho giờ vừa qua:
- **Thời gian chạy**: `5 * * * *` (cron expression)
- **Ví dụ**: Lúc 1:05 AM, tạo summary cho 12:00-1:00 AM
- **Log**: Xem trong console backend

### Cấu Trúc Dữ Liệu AI Summary

```javascript
{
  hourTimestamp: "2025-11-16T10:00:00.000Z",  // Giờ được tóm tắt
  sampleCount: 120,                            // Số mẫu đo
  statistics: {
    temperature: { min: 26.5, max: 30.2, avg: 28.3 },
    humidity: { min: 58.0, max: 65.0, avg: 61.5 },
    aqi: { min: 75, max: 95, avg: 85 },
    pm25: { min: 30.0, max: 40.0, avg: 35.2 }
  },
  aiSummary: "📊 Tóm tắt 1 giờ qua (120 mẫu): 🌡️ Nhiệt độ ấm...",
  createdAt: "2025-11-16T11:05:00.000Z"      // Thời điểm tạo summary
}
```

### Fallback Mechanism

Nếu OpenAI API không khả dụng (lỗi mạng, hết credit, etc.), hệ thống tự động tạo summary cơ bản dựa trên template có sẵn:

```
📊 Tóm tắt 1 giờ qua (120 mẫu):
🌡️ Nhiệt độ thoải mái trung bình 28.3°C (dao động 26.5-30.2°C).
💧 Độ ẩm ổn định ở mức 61.5%.
🌫️ Chất lượng không khí trung bình 🟡 với AQI trung bình 85.
💨 Nồng độ bụi PM2.5: 35.2 µg/m³.
⚠️ Khuyến nghị: Hạn chế hoạt động ngoài trời, sử dụng khẩu trang.
```

### Chi Phí OpenAI API

- **Model**: GPT-3.5-turbo
- **Chi phí ước tính**: ~$0.001 - $0.002 per summary
- **Số lượng**: 24 summaries/ngày = ~$0.024 - $0.048/ngày
- **Tổng tháng**: ~$0.72 - $1.44/tháng

💡 **Tip**: Có thể tắt scheduled job và chỉ tạo summary khi cần để tiết kiệm chi phí.

---

## 🎯 Mở Rộng & Cải Tiến

### Tính Năng Đã Triển Khai

- ✅ **AI Summary theo giờ** (OpenAI GPT-3.5)
- ✅ Scheduled job tự động
- ✅ Fallback mechanism

### Tính Năng Có Thể Thêm

- ✅ Thông báo/cảnh báo khi AQI vượt ngưỡng
- ✅ Export dữ liệu CSV/Excel
- ✅ Bản đồ nhiệt (heatmap) theo thời gian
- ✅ Đa ngôn ngữ (i18n)
- ✅ Authentication & Authorization
- ✅ Nhiều thiết bị/phòng
- ✅ Dashboard admin
- ✅ Dự đoán xu hướng (ML)
- ✅ AI Summary theo ngày/tuần/tháng
- ✅ So sánh AI summary giữa các khoảng thời gian

### Cải Tiến Kỹ Thuật

- ✅ Redis cache cho API
- ✅ Rate limiting
- ✅ Data aggregation (hourly/daily)
- ✅ Unit tests & Integration tests
- ✅ CI/CD pipeline
- ✅ Monitoring & Logging (ELK stack)
- ✅ Containerization (Docker Compose)

---

## 📚 Tài Liệu Tham Khảo

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Node-Cron Documentation](https://www.npmjs.com/package/node-cron)
- [React Documentation](https://react.dev/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [MQTT Protocol](https://mqtt.org/)
- [ESP32 Documentation](https://docs.espressif.com/)

---

## 👥 Đóng Góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📄 License

Project này được phát triển cho mục đích học tập và nghiên cứu.

---

## 📞 Liên Hệ

- **Repository**: [Bo2874/BTL-IoT](https://github.com/Bo2874/BTL-IoT)
- **Branch**: Bo/dev

---

## 🎉 Kết Luận

Hệ thống IoT giám sát chất lượng không khí này cung cấp:
- ✅ Giám sát realtime với độ trễ thấp
- ✅ Lưu trữ lịch sử dài hạn
- ✅ Giao diện trực quan, dễ sử dụng
- ✅ Kiến trúc mở rộng được
- ✅ Code sạch, có cấu trúc

**Chúc bạn triển khai thành công! 🚀**
