# 🌍 BTL-IoT - Hệ Thống Giám Sát Chất Lượng Không Khí Thông Minh

> **Smart Air Quality Monitoring System with IoT & AI**

[![ESP32](https://img.shields.io/badge/ESP32-Dev%20Module-blue.svg)](https://www.espressif.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Tổng Quan

Hệ thống IoT toàn diện giám sát chất lượng không khí theo thời gian thực với các tính năng:

✨ **Tính Năng Chính**
- 📊 **Real-time Monitoring**: Giám sát nhiệt độ, độ ẩm, AQI, bụi PM2.5
- 🔔 **Smart Alerts**: Cảnh báo tự động + còi buzzer khi vượt ngưỡng
- 📱 **Web Dashboard**: Giao diện thân thiện với biểu đồ động
- 🤖 **AI Analysis**: Phân tích xu hướng bằng OpenAI GPT-4o-mini  
- 🔄 **OTA Updates**: Cập nhật firmware từ xa qua WiFi
- 🎛️ **Device Control**: Điều khiển buzzer, quản lý thiết bị từ xa
- 📈 **Data History**: Lưu trữ & truy vấn lịch sử dữ liệu
- 🔐 **Authentication**: Hệ thống đăng nhập/phân quyền JWT

📅 **Cập nhật**: 23/11/2025 | **Version**: 1.1.0

---

## 🏗️ Kiến Trúc Hệ Thống

```mermaid
graph TB
    subgraph ESP32["🔧 ESP32 IoT Device"]
        DHT[DHT11<br/>Temp & Humidity]
        MQ135[MQ135<br/>Air Quality]
        GP2Y[GP2Y1010AU0F<br/>Dust Sensor]
        BUZZER[Active Buzzer<br/>Alarm System]
    end
    
    subgraph MQTT["☁️ MQTT Broker"]
        HIVE[HiveMQ Cloud<br/>TLS 8883]
    end
    
    subgraph Backend["⚙️ Backend Server"]
        API[Express API]
        DB[(MongoDB Atlas)]
        SOCKET[Socket.IO]
        AI[OpenAI GPT-4o-mini]
        OTA[OTA Manager]
    end
    
    subgraph Frontend["🖥️ Web Dashboard"]
        DASH[Dashboard]
        CHART[Charts & Graphs]
        CTRL[Device Control]
        OTAMGMT[OTA Management]
    end
    
    ESP32 -->|Publish Data| HIVE
    HIVE -->|Subscribe| API
    API --> DB
    API --> SOCKET
    API --> AI
    API --> OTA
    SOCKET --> DASH
    DASH --> CHART
    DASH --> CTRL
    CTRL -->|Toggle Buzzer| HIVE
    HIVE -->|MQTT Control| ESP32
    OTAMGMT -->|Upload .bin| OTA
    OTA -->|Download| ESP32
```

### 📡 Luồng Dữ Liệu

1. **ESP32** đọc cảm biến mỗi 2 giây → Publish JSON qua MQTT
2. **Backend** subscribe MQTT → Validate → Lưu MongoDB → Emit Socket.IO
3. **Frontend** nhận WebSocket → Cập nhật realtime charts
4. **AI Analysis** chạy mỗi giờ → Tóm tắt xu hướng & khuyến nghị
5. **OTA System** → Upload firmware → ESP32 tự động cập nhật
---

## ✨ Tính Năng Chi Tiết

### 🎛️ ESP32 Firmware Features

#### **Version 1.0.0 - Base Version**
- ✅ Đọc cảm biến DHT11 (nhiệt độ, độ ẩm)
- ✅ Đọc cảm biến MQ135 (AQI) với trung bình trượt 5 mẫu
- ✅ Đọc cảm biến GP2Y1010AU0F (bụi PM)
- ✅ Publish MQTT mỗi 2 giây
- ✅ OTA update support
- ✅ NTP time sync (GMT+7)
- 🔇 **Buzzer DISABLED** - Không có tính năng còi

#### **Version 1.1.0 - Enhanced with Buzzer** ⭐
- ✅ Tất cả tính năng v1.0.0
- 🔔 **Auto Alarm System**:
  - Tự động kêu khi: Nhiệt độ >35°C, Độ ẩm >80%, AQI >150, Bụi >200 µg/m³
  - Pattern: 3 tiếng beep ngắn (200ms)
- 🎛️ **Manual Buzzer Control**:
  - Bật/tắt từ Web Dashboard
  - Subscribe MQTT topic: `iot/devices/ESP32_01/buzzer/toggle`
  - Còi liên tục khi bật thủ công
- 🔊 **Buzzer Events**:
  - Startup: 2 beep ngắn
  - OTA Start: 5 beep siêu ngắn
  - OTA Progress: Beep mỗi 25%
  - OTA Success: 3 beep dài
- 📊 **Enhanced Logging**: Debug MQTT messages, JSON parsing

### 📱 Web Dashboard

#### **Realtime Monitoring**
- 📊 **Cards hiển thị**:
  - Nhiệt độ (°C) với badge màu
  - Độ ẩm (%) với badge màu
  - AQI với phân loại (Tốt/Trung bình/Kém/Xấu)
  - Bụi PM (µg/m³) với màu cảnh báo
- 🔔 **Buzzer Control Button**:
  - Toggle ON/OFF buzzer từ giao diện
  - Chỉ hoạt động với firmware v1.1.0
  - Hiển thị trạng thái realtime
- 📈 **4 loại biểu đồ**:
  - Line Chart: Nhiệt độ & AQI theo thời gian
  - Bar Chart: So sánh 4 mẫu gần nhất
  - Doughnut Chart: Phân bố chất lượng không khí
  - Gauge Chart: Giá trị trung bình
- ⚡ **Auto-update** qua Socket.IO
- 🕐 **Timestamp** mỗi sample

#### **AI Analysis** 🤖
- **Tự động phân tích mỗi giờ**
- **OpenAI GPT-4o-mini** tạo summary thông minh
- **Nội dung phân tích**:
  - Tóm tắt tình trạng không khí
  - Xu hướng biến đổi (tăng/giảm)
  - So sánh với tiêu chuẩn WHO/EPA
  - Khuyến nghị cho Admin và Workers
- **Modal hiển thị** 24 summaries gần nhất
- **Thống kê**: Tổng samples, avg temp, avg AQI

#### **History Page** 📜
- Xem lại dữ liệu lịch sử
- Charts tương tự Dashboard
- API query với limit tùy chỉnh

#### **Device Management** (Admin) 🔧
- ➕ Thêm/sửa/xóa devices
- 📋 Thông tin: deviceId, name, location, firmware, MAC, IP
- 👥 Assign devices cho Workers
- 🔍 Tìm kiếm & filter

#### **User Management** (Admin) 👥
- ➕ CRUD users (name, email, role)
- 🔐 Role: Admin/Worker
- 📊 Hiển thị số devices của user
- 🔍 Search users

#### **OTA Management** (Admin) 🔄
- 📤 Upload firmware .bin
- 📝 Version management + release notes
- 🔐 MD5 hash auto-generated
- 🚀 Trigger OTA update qua MQTT
- 📊 Firmware list với size, upload date
- 🗑️ Delete firmware

### 🔐 Authentication System

- **JWT-based** với token expire 7 days
- **Bcrypt** hash passwords (saltRounds: 10)
- **Protected Routes**:
  - Frontend: React Router với auth context
  - Backend: Middleware `protect` và `adminOnly`
- **Roles**:
  - **Admin**: Full access (users, devices, OTA, AI summary)
  - **Worker**: View assigned devices only
- **Login/Logout**: Token stored in localStorage

### 📡 MQTT Integration

**Topics:**
- `home/room1/sensors` - ESP32 publish sensor data
- `iot/devices/{deviceId}/ota` - OTA update commands
- `iot/devices/{deviceId}/buzzer` - Trigger buzzer (beep N times)
- `iot/devices/{deviceId}/buzzer/toggle` - Toggle buzzer ON/OFF

**Broker:** HiveMQ Cloud (TLS 8883)

**QoS:** 1 (At least once delivery)

### 🗄️ Database Schema

**Collections:**
- `sensordata` - Dữ liệu cảm biến (deviceId, datetime, temperature, humidity, AQI, dust)
- `users` - Tài khoản (username, email, password, role, devices[])
- `devices` - Thiết bị (deviceId, name, location, firmwareVersion, macAddress, ipAddress)
- `firmwares` - Firmware files (version, filename, filePath, fileSize, md5Hash, releaseNotes)
- `aisummaries` - AI analysis results (summary, stats, timestamp)

---

## 📁 Cấu Trúc Thư Mục

```
BTL-IoT/
├── README.md                           # Tài liệu dự án
├── Documents/
│   ├── FULL_DEMO_GUIDE.md              # Hướng dẫn demo toàn hệ thống
│   └── OTA_DEMO_GUIDE.md               # Hướng dẫn demo OTA firmware
├── Arduino/
│   ├── firmware_v1.0.0/
│   │   └── BTL_IoT_v1.0.0.ino         # Firmware v1.0.0 (còi vô hiệu hóa)
│   ├── firmware_v1.1.0/
│   │   └── BTL_IoT_v1.1.0_FIXED.ino   # Firmware v1.1.0 (còi toggle + fix OTA)
│   └── BTL_IoT/
│       └── BTL_IoT.ino                 # Legacy code (deprecated)
└── Source/
    ├── backend/
    │   ├── package.json                # Dependencies: express, mqtt, mongoose, multer, socket.io
    │   ├── uploads/
    │   │   └── firmware/                # Lưu trữ file .bin firmware
    │   └── src/
    │       ├── server.js               # Entry point: Express + MongoDB + Socket.IO + MQTT
    │       ├── config/
    │       │   └── mqttConfig.js       # MQTT broker config (mqtt://localhost:1883)
    │       ├── controllers/
    │       │   ├── sensorController.js # API: GET/POST sensor data
    │       │   ├── summaryController.js # API: GET AI summaries
    │       │   ├── authController.js   # API: POST /login, /register
    │       │   ├── userController.js   # API: User CRUD
    │       │   ├── deviceController.js # API: Device management + buzzer control
    │       │   └── firmwareController.js # API: Upload/Download firmware, Trigger OTA
    │       ├── models/
    │       │   ├── sensorData.js       # Schema: {deviceId, temperature, humidity, mq135, timestamp}
    │       │   ├── hourlySummary.js    # Schema: {summary, timestamp, metrics}
    │       │   ├── user.js             # Schema: {username, password, role}
    │       │   ├── device.js           # Schema: {deviceId, location, firmwareVersion}
    │       │   └── firmware.js         # Schema: {version, filePath, md5Hash, uploadedAt}
    │       ├── middleware/
    │       │   └── authMiddleware.js   # JWT verification + role-based access
    │       ├── services/
    │       │   └── openaiService.js    # OpenAI API integration
    │       ├── jobs/
    │       │   └── scheduledJobs.js    # Cron: Tự động tạo summary mỗi giờ
    │       ├── mqtt/
    │       │   └── mqttClient.js       # Subscribe topics, emit Socket.IO events
    │       ├── realtime/
    │       │   └── socket.js           # Socket.IO server setup
    │       └── routes/
    │           ├── sensorRoutes.js     # Routes: /api/sensors/*
    │           ├── summaryRoutes.js    # Routes: /api/summaries/*
    │           ├── authRoutes.js       # Routes: /api/auth/*
    │           ├── userRoutes.js       # Routes: /api/users/*
    │           ├── deviceRoutes.js     # Routes: /api/devices/*
    │           └── firmwareRoutes.js   # Routes: /api/firmware/*
    └── frontend/
        ├── index.html
        ├── package.json                # Dependencies: react, vite, socket.io-client
        ├── vite.config.js              # Dev server port 5173, proxy /api → :5000
        └── src/
            ├── App.jsx                 # React Router: /dashboard, /history, /admin, etc.
            ├── main.jsx                # React entry point
            ├── config.js               # API_URL configuration
            ├── api/
            │   ├── sensors.js          # Axios: getSensorData, getRealtimeData
            │   ├── summaries.js        # Axios: getSummaries, getSummaryById
            │   ├── auth.js             # Axios: login, register, logout
            │   ├── users.js            # Axios: getUsers, updateUser, deleteUser
            │   ├── devices.js          # Axios: getDevices, toggleBuzzer
            │   └── firmware.js         # Axios: uploadFirmware, triggerOTA
            ├── components/
            │   ├── AQIBadge.jsx        # Display AQI level badge
            │   ├── AISummaryModal.jsx  # Modal show AI summary
            │   ├── Loader.jsx          # Loading spinner
            │   ├── RealtimeCard.jsx    # Realtime sensor card
            │   ├── SensorChart.jsx     # Line chart (Chart.js)
            │   └── ProtectedRoute.jsx  # Auth route wrapper
            ├── contexts/
            │   └── AuthContext.jsx     # Auth state management
            ├── hooks/
            │   └── useFetch.js         # Custom data fetching hook
            ├── pages/
            │   ├── Login.jsx           # Login page
            │   ├── Register.jsx        # Registration page
            │   ├── Dashboard.jsx       # Main dashboard + buzzer toggle
            │   ├── History.jsx         # Historical data page
            │   ├── AdminPanel.jsx      # Device management (Admin only)
            │   ├── UserManagement.jsx  # User management (Admin only)
            │   └── OTAManagement.jsx   # Firmware OTA (Admin only)
            ├── styles/
            │   ├── global.css          # Global styles
            │   ├── admin.css           # Admin panel styles
            │   ├── user.css            # User management styles
            │   └── ota.css             # OTA management styles
            └── utils/
                ├── aqiColor.js         # AQI color mapping
                └── formatDate.js       # Date formatting utilities
```

---

## 🛠️ Yêu Cầu Hệ Thống

### Backend & Frontend
- **Node.js**: >= 18.x
- **npm**: >= 8.x
- **MongoDB**: Cloud (MongoDB Atlas) hoặc local
- **MQTT Broker**: HiveMQ Cloud hoặc Mosquitto local

### ESP32 Firmware
- **Arduino IDE**: >= 2.x (hoặc PlatformIO)
- **ESP32 Board**: ESP32-WROOM-32 hoặc tương tự
- **Sensors**:
  - DHT22 (Temperature & Humidity)
  - MQ135 (Air Quality)
  - GP2Y1010AU0F (Dust Sensor)
  - Active Buzzer (optional cho v1.1.0)
- **Arduino Libraries**:
  - WiFi.h (ESP32 built-in)
  - PubSubClient (MQTT)
  - DHT sensor library
  - ArduinoJson (>= 6.x)
  - HTTPClient (OTA download)
  - Update.h (OTA flash)
  - MD5Builder (OTA verification)

---

## ⚙️ Cài Đặt & Chạy

### 1️⃣ Backend

```powershell
# Di chuyển đến thư mục backend
cd C:\BTL-IoT\Source\backend

# Cài đặt dependencies
npm install

# Tạo file .env (xem phần Biến Môi Trường bên dưới)
notepad .env

# Chạy development mode với nodemon
npm run dev

# Hoặc chạy production
npm start
```

**Backend sẽ chạy tại**: `http://localhost:5000`

**Services khởi động**:
- ✅ Express server (port 5000)
- ✅ MongoDB connection
- ✅ MQTT client subscription
- ✅ Socket.IO realtime server
- ✅ Scheduled cron jobs (hourly AI summary)

### 2️⃣ Frontend

```powershell
# Mở terminal mới, di chuyển đến thư mục frontend
cd C:\BTL-IoT\Source\frontend

# Cài đặt dependencies
npm install

# Chạy Vite development server
npm run dev
```

**Frontend sẽ chạy tại**: `http://localhost:5173`

**Vite dev server features**:
- ⚡ Hot Module Replacement (HMR)
- 🔄 Proxy `/api` requests → `http://localhost:5000`
- 🌐 Socket.IO client connection

### 3️⃣ ESP32 Firmware

**Option A: Arduino IDE (Recommended for beginners)**

1. Mở Arduino IDE
2. Install ESP32 board support:
   - File → Preferences → Additional Board URLs
   - Add: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Tools → Board → Boards Manager → Search "ESP32" → Install
3. Install required libraries:
   - Sketch → Include Library → Manage Libraries
   - Search và install: `PubSubClient`, `DHT sensor library`, `ArduinoJson`
4. Mở file firmware:
   - `C:\BTL-IoT\Arduino\firmware_v1.1.0\BTL_IoT_v1.1.0_FIXED.ino` (buzzer enabled)
   - Hoặc `C:\BTL-IoT\Arduino\firmware_v1.0.0\BTL_IoT_v1.0.0.ino` (buzzer disabled)
5. Cấu hình WiFi & MQTT trong code:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   const char* mqtt_server = "your-cluster.s1.eu.hivemq.cloud";
   const int mqtt_port = 8883;
   const char* mqtt_user = "esp32-air-system";
   const char* mqtt_pass = "YourStrongPassword123";
   ```
6. Upload code:
   - Tools → Board → "ESP32 Dev Module"
   - Tools → Port → (chọn COM port của ESP32)
   - Sketch → Upload

**Option B: Export Compiled Binary (for OTA)**

1. Sau khi cấu hình code như Option A
2. Sketch → Export compiled Binary
3. File `.bin` sẽ được tạo trong thư mục sketch (hoặc `build/`)
4. Lưu ý: Chọn file `*.ino.bin` (KHÔNG phải `.bootloader.bin` hay `.partitions.bin`)
5. Upload file này qua OTA Management UI

### 4️⃣ Truy Cập Ứng Dụng

1. Đăng nhập tại: **http://localhost:5173/login**
   - Default admin: `admin` / `admin123` (tạo qua Register nếu chưa có)
2. Các trang chính:
   - **Dashboard**: http://localhost:5173/dashboard - Realtime data + Buzzer toggle
   - **History**: http://localhost:5173/history - Historical charts
   - **Admin Panel**: http://localhost:5173/admin - Device management (Admin only)
   - **OTA Management**: http://localhost:5173/ota - Firmware upload (Admin only)

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

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# OpenAI API (for AI Summary)
OPENAI_API_KEY=sk-your-openai-api-key-here

# MQTT Configuration
MQTT_BROKER_URL=mqtts://your-cluster.s1.eu.hivemq.cloud
MQTT_PORT=8883
MQTT_USERNAME=esp32-air-system
MQTT_PASSWORD=YourStrongPassword123

# MQTT Topics (optional overrides)
MQTT_TOPIC_SENSORS=iot/devices/+/data
MQTT_TOPIC_OTA=iot/devices/+/ota
MQTT_TOPIC_BUZZER_TOGGLE=iot/devices/+/buzzer/toggle
MQTT_TOPIC_BUZZER_BEEP=iot/devices/+/buzzer
```

### 📝 Giải Thích Biến

| Biến | Mô Tả | Mặc Định |
|------|-------|----------|
| `MONGO_URI` | MongoDB connection string | **Bắt buộc** |
| `PORT` | Port chạy backend server | `5000` |
| `NODE_ENV` | Môi trường (`development`/`production`) | `development` |
| `BACKEND_URL` | URL backend (cho scheduled jobs gọi API) | `http://localhost:5000` |
| `FRONTEND_ORIGIN` | URL frontend cho CORS policy | `*` (allow all) |
| `JWT_SECRET` | Secret key để sign JWT token | **Bắt buộc** |
| `JWT_EXPIRE` | Thời gian hết hạn token | `7d` |
| `OPENAI_API_KEY` | OpenAI API key (cho AI Summary feature) | **Bắt buộc cho AI** |
| `MQTT_BROKER_URL` | URL MQTT broker (mqtts:// cho TLS) | **Bắt buộc** |
| `MQTT_PORT` | Port MQTT (1883: TCP, 8883: TLS) | `8883` |
| `MQTT_USERNAME` | Username authenticate MQTT | **Bắt buộc nếu broker yêu cầu** |
| `MQTT_PASSWORD` | Password authenticate MQTT | **Bắt buộc nếu broker yêu cầu** |
| `MQTT_TOPIC_*` | Override default MQTT topics | Xem mqttConfig.js |

---

## 🌐 API Endpoints

### Base URL
```
http://localhost:5000/api
```

---

### 📊 Sensor Data APIs

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
      "_id": "675885c0a6b1234567890abc",
      "deviceId": "ESP32_01",
      "temperature": 29.3,
      "humidity": 61.5,
      "mq135": 450,
      "dust": 35.2,
      "timestamp": "2025-01-20T05:34:56.789Z"
    }
  ]
}
```

#### 2. Lấy Dữ Liệu Realtime (mới nhất từng device)
```http
GET /api/sensors/realtime
```

**Response:**
```json
{
  "deviceId": "ESP32_01",
  "temperature": 29.3,
  "humidity": 61.5,
  "mq135": 450,
  "dust": 35.2,
  "timestamp": "2025-01-20T05:34:56.789Z"
}
```

#### 3. Lấy Lịch Sử (Pagination)
```http
GET /api/sensors/history?limit=100&page=1
```

**Query Parameters:**
- `limit` (optional): Số lượng bản ghi per page (default: 50)
- `page` (optional): Trang số (default: 1)
- `deviceId` (optional): Filter theo device ID

**Response:**
```json
{
  "success": true,
  "count": 100,
  "page": 1,
  "totalPages": 10,
  "data": [
    {
      "deviceId": "ESP32_01",
      "temperature": 29.3,
      "humidity": 61.5,
      "mq135": 450,
      "dust": 35.2,
      "timestamp": "2025-01-20T05:34:56.789Z"
    }
  ]
}
```

---

### 🤖 AI Summary APIs

#### 4. Tạo AI Summary Cho 1 Giờ (Manual Trigger)
```http
POST /api/summaries
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "hourTimestamp": "2025-01-20T05:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Summary created successfully",
  "data": {
    "_id": "675885c0a6b1234567890def",
    "hourTimestamp": "2025-01-20T05:00:00.000Z",
    "sampleCount": 120,
    "statistics": {
      "temperature": { "min": 26.5, "max": 30.2, "avg": 28.3 },
      "humidity": { "min": 58.0, "max": 65.0, "avg": 61.5 },
      "mq135": { "min": 400, "max": 500, "avg": 450 },
      "dust": { "min": 30.0, "max": 40.0, "avg": 35.2 }
    },
    "aiSummary": "📊 Trong 1 giờ qua (05:00-06:00), chất lượng không khí ổn định ở mức trung bình với MQ135 dao động 400-500 ppm. Nhiệt độ và độ ẩm trong phạm vi thoải mái (26.5-30.2°C, 58-65%). Bụi mịn PM2.5 trung bình 35.2 µg/m³ - mức chấp nhận được nhưng nên theo dõi.",
    "createdAt": "2025-01-20T06:05:00.000Z"
  }
}
```

**Note**: Cron job tự động tạo summary mỗi giờ, API này dùng để tạo thủ công nếu cần.

#### 5. Lấy Danh Sách AI Summaries
```http
GET /api/summaries?limit=24
```

**Query Parameters:**
- `limit` (optional): Số lượng summaries (default: 24 - 1 ngày)

**Response:**
```json
{
  "success": true,
  "count": 24,
  "data": [
    {
      "_id": "675885c0a6b1234567890def",
      "hourTimestamp": "2025-01-20T05:00:00.000Z",
      "sampleCount": 120,
      "statistics": {
        "temperature": { "min": 26.5, "max": 30.2, "avg": 28.3 },
        "humidity": { "min": 58.0, "max": 65.0, "avg": 61.5 },
        "mq135": { "min": 400, "max": 500, "avg": 450 },
        "dust": { "min": 30.0, "max": 40.0, "avg": 35.2 }
      },
      "aiSummary": "📊 Tóm tắt chất lượng không khí 1 giờ qua...",
      "createdAt": "2025-01-20T06:05:00.000Z"
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
GET /api/summaries/2025-01-20T05:00:00.000Z
```

**Response:** Tương tự như API #5 (single object)

---

### 🔐 Authentication APIs

#### 7. Đăng Ký User Mới
```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "worker1",
  "email": "worker1@iot.com",
  "password": "worker123",
  "role": "Worker"
}
```

**Roles:** `Admin`, `Manager`, `Worker`

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "675885c0a6b1234567890xyz",
    "username": "worker1",
    "email": "worker1@iot.com",
    "role": "Worker",
    "createdAt": "2025-01-20T07:00:00.000Z"
  }
}
```

#### 8. Đăng Nhập
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "675885c0a6b1234567890abc",
    "username": "admin",
    "email": "admin@iot.com",
    "role": "Admin"
  }
}
```

**Token expires in 7 days** (configurable via `JWT_EXPIRE`)

#### 9. Lấy Thông Tin User Hiện Tại
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "675885c0a6b1234567890abc",
    "username": "admin",
    "email": "admin@iot.com",
    "role": "Admin"
  }
}
```

---

### 🛠️ Device Management APIs (Admin Only)

#### 10. Lấy Tất Cả Devices
```http
GET /api/devices
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "devices": [
    {
      "_id": "675885c0a6b1234567890abc",
      "deviceId": "ESP32_01",
      "name": "Air Quality Sensor - Room A",
      "location": "Workshop Floor 2",
      "firmwareVersion": "1.1.0",
      "macAddress": "AA:BB:CC:DD:EE:01",
      "ipAddress": "192.168.1.101",
      "status": "online",
      "assignedWorkers": ["675885c0a6b1234567890def"],
      "createdAt": "2025-01-20T10:00:00.000Z",
      "updatedAt": "2025-01-20T12:00:00.000Z"
    },
    {
      "_id": "675885c0a6b1234567890cde",
      "deviceId": "ESP32_02",
      "name": "Air Quality Sensor - Room B",
      "location": "Office Floor 1",
      "firmwareVersion": "1.0.0",
      "macAddress": "AA:BB:CC:DD:EE:02",
      "ipAddress": "192.168.1.102",
      "status": "offline",
      "assignedWorkers": [],
      "createdAt": "2025-01-19T08:00:00.000Z",
      "updatedAt": "2025-01-19T08:00:00.000Z"
    }
  ]
}
```

#### 11. Thêm Device Mới
```http
POST /api/devices
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "deviceId": "ESP32_03",
  "name": "Air Quality Sensor - Office",
  "location": "Office Floor 3",
  "firmwareVersion": "1.0.0",
  "macAddress": "AA:BB:CC:DD:EE:03",
  "ipAddress": "192.168.1.103"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device created successfully",
  "device": { /* device object */ }
}
```

#### 12. Cập Nhật Device
```http
PUT /api/devices/:deviceId
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "name": "Air Quality Sensor - Updated Name",
  "location": "Office Floor 2",
  "firmwareVersion": "1.1.0"
}
```

#### 13. Xóa Device
```http
DELETE /api/devices/:deviceId
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Device deleted successfully"
}
```

#### 14. Toggle Buzzer (Bật/Tắt Còi)
```http
POST /api/devices/:deviceId/buzzer/toggle
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "state": "on"
}
```

**States:** `on` | `off`

**Response:**
```json
{
  "success": true,
  "message": "Buzzer toggle command sent via MQTT",
  "deviceId": "ESP32_01",
  "state": "on"
}
```

**MQTT Topic Published:** `iot/devices/ESP32_01/buzzer/toggle`  
**MQTT Payload:** `{"action":"toggle","state":"on"}`

**Note:** Chỉ hoạt động với firmware v1.1.0 trở lên (v1.0.0 không subscribe topic này)

---

### 👥 User Management APIs (Admin Only)

#### 15. Lấy Tất Cả Users
```http
GET /api/users
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "users": [
    {
      "_id": "675885c0a6b1234567890abc",
      "username": "admin",
      "email": "admin@iot.com",
      "role": "Admin",
      "createdAt": "2025-01-15T10:00:00.000Z"
    },
    {
      "_id": "675885c0a6b1234567890def",
      "username": "worker1",
      "email": "worker1@iot.com",
      "role": "Worker",
      "createdAt": "2025-01-18T14:30:00.000Z"
    }
  ]
}
```

#### 16. Cập Nhật Role User
```http
PUT /api/users/:userId/role
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "role": "Manager"
}
```

**Roles:** `Admin`, `Manager`, `Worker`

#### 17. Xóa User
```http
DELETE /api/users/:userId
Authorization: Bearer <admin_token>
```

---

### 🔄 OTA Firmware Management APIs

#### 18. Upload Firmware File (Admin Only)
```http
POST /api/firmware/upload
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `firmware`: File .bin (compiled ESP32 firmware)
- `version`: "1.1.0" (version string)
- `releaseNotes`: "Added buzzer toggle + Fixed MD5 OTA verification" (optional)

**Response:**
```json
{
  "success": true,
  "message": "Firmware uploaded successfully",
  "firmware": {
    "_id": "675885c0a6b1234567890ghi",
    "version": "1.1.0",
    "filename": "firmware_1763815786830_sketch_nov22a.1.1.0.ino.bin",
    "filePath": "C:\\BTL-IoT\\Source\\backend\\uploads\\firmware\\firmware_1763815786830_sketch_nov22a.1.1.0.ino.bin",
    "fileSize": 1073216,
    "md5Hash": "35462a113e9ae1a8dc9dbd750c85adaf",
    "releaseNotes": "Added buzzer toggle + Fixed MD5 OTA verification",
    "uploadedAt": "2025-01-20T15:00:00.000Z"
  }
}
```

**Important:** File được lưu tại `backend/uploads/firmware/`. Chọn file `*.ino.bin` (KHÔNG phải `.bootloader.bin`, `.partitions.bin`, hoặc `.merged.bin`)

#### 19. Lấy Danh Sách Firmware (Admin Only)
```http
GET /api/firmware
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "firmwares": [
    {
      "_id": "675885c0a6b1234567890ghi",
      "version": "1.1.0",
      "filename": "firmware_1763815786830_sketch_nov22a.1.1.0.ino.bin",
      "fileSize": 1073216,
      "md5Hash": "35462a113e9ae1a8dc9dbd750c85adaf",
      "releaseNotes": "Added buzzer toggle + Fixed MD5 OTA",
      "uploadedAt": "2025-01-20T15:00:00.000Z"
    },
    {
      "_id": "675885c0a6b1234567890jkl",
      "version": "1.0.0",
      "filename": "firmware_1763805786830_v1.0.0.bin",
      "fileSize": 1024000,
      "md5Hash": "def456...",
      "releaseNotes": "Base firmware - buzzer disabled",
      "uploadedAt": "2025-01-18T10:00:00.000Z"
    }
  ]
}
```

#### 20. Check Latest Firmware (ESP32 Public API)
```http
GET /api/firmware/latest?current=1.0.0
```

**Query Parameters:**
- `current` (required): Current firmware version running on ESP32

**Response (update available):**
```json
{
  "hasUpdate": true,
  "currentVersion": "1.0.0",
  "latestVersion": "1.1.0",
  "fileSize": 1073216,
  "md5Hash": "35462a113e9ae1a8dc9dbd750c85adaf",
  "releaseNotes": "Added buzzer toggle + Fixed MD5 OTA verification",
  "downloadUrl": "/api/firmware/download/1.1.0"
}
```

**Response (up to date):**
```json
{
  "hasUpdate": false,
  "currentVersion": "1.1.0",
  "latestVersion": "1.1.0"
}
```

#### 21. Download Firmware Binary (ESP32 Public API)
```http
GET /api/firmware/download/:version
```

**Example:**
```http
GET /api/firmware/download/1.1.0
```

**Response:**
- Binary file stream với headers:
  ```
  Content-Type: application/octet-stream
  Content-Disposition: attachment; filename="firmware_1763815786830_sketch_nov22a.1.1.0.ino.bin"
  Content-Length: 1073216
  X-MD5: 35462a113e9ae1a8dc9dbd750c85adaf
  ```

**Note:** ESP32 HTTPClient MUST call `http.collectHeaders(keys[], count)` BEFORE `http.GET()` để nhận `X-MD5` header!

#### 22. Trigger OTA Update (Admin Only)
```http
POST /api/firmware/trigger-update
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "deviceId": "ESP32_01",
  "version": "1.1.0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTA update command sent to device ESP32_01 via MQTT",
  "deviceId": "ESP32_01",
  "version": "1.1.0"
}
```

**MQTT Action:**
- **Topic:** `iot/devices/ESP32_01/ota`
- **Payload:** `{"version":"1.1.0"}`

**ESP32 Flow:**
1. Receive MQTT message on `/ota` topic
2. Parse `version` from JSON payload
3. Call backend `/api/firmware/download/1.1.0`
4. Verify MD5 hash using `X-MD5` header
5. Flash firmware using `Update.write()`
6. Reboot with new firmware

#### 23. Xóa Firmware (Admin Only)
```http
DELETE /api/firmware/:firmwareId
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Firmware deleted successfully"
}
```

**Action:** Xóa file vật lý và record trong database.

---

## 🔌 Socket.IO Realtime Events

### Client Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');
```

### Event: `sensor:update`

**Kích hoạt:** Mỗi khi backend nhận MQTT message từ ESP32

**Payload:**
```json
{
  "deviceId": "ESP32_01",
  "temperature": 29.3,
  "humidity": 61.5,
  "mq135": 450,
  "dust": 35.2,
  "timestamp": "2025-01-20T05:34:56.789Z"
}
```

**Frontend Usage (React):**
```javascript
useEffect(() => {
  socket.on('sensor:update', (data) => {
    console.log('📡 New sensor data:', data);
    setRealtimeData(data); // Update state
  });

  return () => {
    socket.off('sensor:update');
  };
}, []);
```

### Event: `device:status:update`

**Kích hoạt:** Khi device online/offline status thay đổi

**Payload:**
```json
{
  "deviceId": "ESP32_01",
  "status": "online",
  "lastSeen": "2025-01-20T05:34:56.789Z"
}
```

---

## 📊 MongoDB Schema

### Collection: `sensordatas`

```javascript
{
  deviceId: String,           // "ESP32_01"
  temperature: Number,        // -50 đến 100 (°C)
  humidity: Number,           // 0 đến 100 (%)
  mq135: Number,              // 0 đến 1023 (raw ADC hoặc ppm)
  dust: Number,               // >= 0 (µg/m³ PM2.5)
  timestamp: Date,            // Thời gian đo (ISODate)
  createdAt: Date             // Auto-generated (indexed)
}
```

**Indexes:**
- `{ createdAt: -1 }` - Sort by newest first
- `{ deviceId: 1, createdAt: -1 }` - Query by device + time

### Collection: `hourlysummaries`

```javascript
{
  hourTimestamp: Date,        // "2025-01-20T10:00:00.000Z" (indexed, unique)
  sampleCount: Number,        // Số lượng bản ghi trong giờ
  statistics: {
    temperature: { min: Number, max: Number, avg: Number },
    humidity: { min: Number, max: Number, avg: Number },
    mq135: { min: Number, max: Number, avg: Number },
    dust: { min: Number, max: Number, avg: Number }
  },
  aiSummary: String,          // Text summary từ OpenAI API
  createdAt: Date             // Auto-generated
}
```

**Indexes:**
- `{ hourTimestamp: -1 }` - Unique timestamp per hour
- `{ createdAt: -1 }` - Sort by creation time

### Collection: `users`

```javascript
{
  username: String,           // Unique, required
  email: String,              // Unique, required
  password: String,           // Hashed với bcrypt (saltRounds: 10)
  role: String,               // "Admin" | "Manager" | "Worker"
  createdAt: Date,            // Auto-generated
  updatedAt: Date             // Auto-updated
}
```

**Indexes:**
- `{ username: 1 }` - Unique username
- `{ email: 1 }` - Unique email

**Pre-save Middleware:** Hash password with bcrypt before saving

### Collection: `devices`

```javascript
{
  deviceId: String,           // Unique, required (e.g., "ESP32_01")
  name: String,               // Device display name
  location: String,           // Physical location description
  firmwareVersion: String,    // Current firmware version (e.g., "1.1.0")
  macAddress: String,         // MAC address (optional)
  ipAddress: String,          // IP address (optional)
  status: String,             // "online" | "offline"
  lastSeen: Date,             // Last communication timestamp
  assignedWorkers: [ObjectId], // References to User._id (Workers)
  createdAt: Date,            // Auto-generated
  updatedAt: Date             // Auto-generated
}
```

  updatedAt: Date             // Auto-updated
}
```

**Indexes:**
- `{ deviceId: 1 }` - Unique device identifier
- `{ status: 1 }` - Filter by online/offline

### Collection: `firmwares`

```javascript
{
  version: String,            // Unique, required (e.g., "1.1.0")
  filename: String,           // Original firmware filename
  filePath: String,           // Absolute path to .bin file
  fileSize: Number,           // File size in bytes
  md5Hash: String,            // MD5 checksum for OTA verification
  releaseNotes: String,       // Update description (optional)
  uploadedAt: Date,           // Upload timestamp
  createdAt: Date             // Auto-generated
}
```

**Indexes:**
- `{ version: 1 }` - Unique version identifier
- `{ uploadedAt: -1 }` - Sort by upload time

**Validation:**
- `version`: Required, unique semver format (e.g., "1.0.0", "1.1.0")
- `fileSize`: Must be > 0 bytes
- `md5Hash`: Required, 32-character hex string

---

## 📡 MQTT Topics & Message Format

### Published by Backend (Server → ESP32)

#### Topic: `iot/devices/{deviceId}/ota`
**Purpose:** Trigger OTA firmware update

**Message (JSON):**
```json
{
  "version": "1.1.0"
}
```

**Example:**
```
Topic: iot/devices/ESP32_01/ota
Payload: {"version":"1.1.0"}
```

#### Topic: `iot/devices/{deviceId}/buzzer/toggle`
**Purpose:** Manual buzzer control (v1.1.0+ only)

**Message (JSON):**
```json
{
  "action": "toggle",
  "state": "on"
}
```

**States:** `on` (continuous beep) | `off` (silence)

**Example:**
```
Topic: iot/devices/ESP32_01/buzzer/toggle
Payload: {"action":"toggle","state":"on"}
```

#### Topic: `iot/devices/{deviceId}/buzzer`
**Purpose:** Trigger single beep (alarm, notification)

**Message (String):**
```
beep
```

**Example:**
```
Topic: iot/devices/ESP32_01/buzzer
Payload: beep
```

---

### Published by ESP32 (Device → Server)

#### Topic: `iot/devices/{deviceId}/data`
**Purpose:** Send sensor readings to backend

**Message (JSON):**
```json
{
  "temperature": 29.3,
  "humidity": 61.5,
  "mq135": 450,
  "dust": 35.2
}
```

**Example:**
```
Topic: iot/devices/ESP32_01/data
Payload: {"temperature":29.3,"humidity":61.5,"mq135":450,"dust":35.2}
```

**Backend Action:**
1. Parse JSON payload
2. Add `deviceId` and `timestamp`
3. Save to MongoDB `sensordatas` collection
4. Emit `sensor:update` via Socket.IO to frontend

#### Topic: `iot/devices/{deviceId}/status`
**Purpose:** Report device online/offline status

**Message (JSON):**
```json
{
  "status": "online",
  "firmwareVersion": "1.1.0",
  "ipAddress": "192.168.1.101"
}
```

---

### MQTT Wildcard Subscriptions (Backend)

Backend subscribes với wildcard để nhận từ tất cả devices:

```javascript
const topics = [
  'iot/devices/+/data',      // All sensor data
  'iot/devices/+/status',    // All status updates
  'iot/devices/+/ota',       // All OTA responses (optional)
];
```

---

## 🤖 ESP32 Firmware

### Cảm Biến Sử Dụng

| Cảm Biến | Chức Năng | Pin ESP32 | Thông Số |
|----------|-----------|-----------|----------|
| **DHT22** | Nhiệt độ, độ ẩm | GPIO 15 (DATA) | VCC: 3.3V, Range: -40~80°C, 0~100% |
| **MQ135** | Chất lượng không khí | GPIO 32 (AO - Analog) | VCC: 5V, Output: 0-1023 ADC |
| **GP2Y1010AU0F** | Bụi mịn PM2.5 | GPIO 35 (AO), GPIO 4 (LED) | VCC: 5V, Range: 0-500 µg/m³ |
| **Active Buzzer** | Cảnh báo còi | GPIO 5 (SIGNAL) | VCC: 5V, Logic: Active HIGH (v1.1.0) |

### Pin Configuration

```cpp
// Sensor pins
#define DHT_PIN 15           // DHT22 data pin
#define MQ135_PIN 32         // MQ135 analog output
#define DUST_LED_PIN 4       // GP2Y1010AU0F LED control
#define DUST_SENSOR_PIN 35   // GP2Y1010AU0F analog output
#define BUZZER_PIN 5         // Active buzzer control (v1.1.0+)

// Sensor parameters
#define DHT_TYPE DHT22
#define SAMPLING_TIME 280    // GP2Y1010AU0F sampling time (µs)
#define DELTA_TIME 40        // GP2Y1010AU0F delta time (µs)
#define SLEEP_TIME 9680      // GP2Y1010AU0F sleep time (µs)
```

### Code Structure (Firmware v1.1.0)

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <HTTPClient.h>
#include <Update.h>
#include <MD5Builder.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT settings (HiveMQ Cloud)
const char* mqtt_server = "your-cluster.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "esp32-air-system";
const char* mqtt_pass = "YourPassword123";

// MQTT topics
const char* TOPIC_SENSOR_DATA = "iot/devices/ESP32_01/data";
const char* TOPIC_OTA = "iot/devices/ESP32_01/ota";
const char* TOPIC_BUZZER_TOGGLE = "iot/devices/ESP32_01/buzzer/toggle";
const char* TOPIC_BUZZER_BEEP = "iot/devices/ESP32_01/buzzer";

// Firmware version
const char* FIRMWARE_VERSION = "1.1.0";

WiFiClientSecure espClient;
PubSubClient client(espClient);
DHT dht(DHT_PIN, DHT_TYPE);

// Global state
bool buzzerState = false;  // Manual toggle state
unsigned long lastPublish = 0;
const unsigned long PUBLISH_INTERVAL = 10000; // 10 seconds

void setup() {
  Serial.begin(115200);
  
  // Print firmware banner
  Serial.println("🟢🟢🟢 FIRMWARE VERSION 1.1.0 🟢🟢🟢");
  Serial.println("✅ Buzzer control ENABLED");
  
  // Pin setup
  pinMode(DUST_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);  // Buzzer OFF initially
  
  // Sensor initialization
  dht.begin();
  
  // WiFi connection
  connectWiFi();
  
  // MQTT setup
  espClient.setInsecure();  // Skip TLS cert verification (for HiveMQ Cloud)
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);
  
  connectMQTT();
}

void loop() {
  if (!client.connected()) {
    connectMQTT();
  }
  client.loop();
  
  // Publish sensor data every 10 seconds
  if (millis() - lastPublish >= PUBLISH_INTERVAL) {
    publishSensorData();
    lastPublish = millis();
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.printf("📨 MQTT: %s → %s\n", topic, message.c_str());
  
  // OTA update trigger
  if (String(topic) == TOPIC_OTA) {
    DynamicJsonDocument doc(256);
    deserializeJson(doc, message);
    String version = doc["version"];
    performOTAUpdate(version);
  }
  
  // Buzzer toggle control
  if (String(topic) == TOPIC_BUZZER_TOGGLE) {
    DynamicJsonDocument doc(256);
    deserializeJson(doc, message);
    String state = doc["state"];
    
    if (state == "on") {
      digitalWrite(BUZZER_PIN, HIGH);
      buzzerState = true;
      Serial.println("🔊 Buzzer ON (continuous)");
    } else {
      digitalWrite(BUZZER_PIN, LOW);
      buzzerState = false;
      Serial.println("🔇 Buzzer OFF");
    }
  }
  
  // Single beep trigger
  if (String(topic) == TOPIC_BUZZER_BEEP && message == "beep") {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(500);
    digitalWrite(BUZZER_PIN, LOW);
    Serial.println("🔔 Beep!");
  }
}

void publishSensorData() {
  // Read sensors
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int mq135 = analogRead(MQ135_PIN);
  float dust = readDustSensor();
  
  // Validate readings
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("❌ DHT22 read failed!");
    return;
  }
  
  // Build JSON payload
  DynamicJsonDocument doc(256);
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["mq135"] = mq135;
  doc["dust"] = dust;
  
  String payload;
  serializeJson(doc, payload);
  
  // Publish to MQTT
  if (client.publish(TOPIC_SENSOR_DATA, payload.c_str())) {
    Serial.printf("📤 Published: %s\n", payload.c_str());
  } else {
    Serial.println("❌ Publish failed!");
  }
}

float readDustSensor() {
  digitalWrite(DUST_LED_PIN, LOW);
  delayMicroseconds(SAMPLING_TIME);
  
  int voMeasured = analogRead(DUST_SENSOR_PIN);
  
  delayMicroseconds(DELTA_TIME);
  digitalWrite(DUST_LED_PIN, HIGH);
  delayMicroseconds(SLEEP_TIME);
  
  float calcVoltage = voMeasured * (3.3 / 4095.0);
  float dustDensity = 170 * calcVoltage - 0.1;
  
  return max(dustDensity, 0.0f);
}

void performOTAUpdate(String version) {
  Serial.printf("🔄 Starting OTA update to v%s\n", version.c_str());
  
  String url = String("http://192.168.1.100:5000/api/firmware/download/") + version;
  
  HTTPClient http;
  
  // CRITICAL: Collect X-MD5 header BEFORE GET request
  const char* headerKeys[] = {"X-MD5"};
  const size_t headerKeysCount = 1;
  http.collectHeaders(headerKeys, headerKeysCount);
  
  http.begin(url);
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String md5Header = http.header("X-MD5");
    int contentLength = http.getSize();
    
    Serial.printf("🔐 Expected MD5: %s\n", md5Header.c_str());
    Serial.printf("📦 File size: %d bytes\n", contentLength);
    
    if (md5Header.length() == 0) {
      Serial.println("❌ X-MD5 header missing!");
      http.end();
      return;
    }
    
    // Start OTA update
    if (Update.begin(contentLength)) {
      WiFiClient* stream = http.getStreamPtr();
      MD5Builder md5;
      md5.begin();
      
      size_t written = 0;
      uint8_t buffer[1024];
      
      while (http.connected() && written < contentLength) {
        size_t available = stream->available();
        if (available) {
          int bytesRead = stream->readBytes(buffer, min(available, sizeof(buffer)));
          written += Update.write(buffer, bytesRead);
          md5.add(buffer, bytesRead);
          
          Serial.printf("📥 Downloaded: %d/%d bytes\n", written, contentLength);
        }
        delay(1);
      }
      
      md5.calculate();
      String calculatedMD5 = md5.toString();
      
      Serial.printf("🔍 Calculated MD5: %s\n", calculatedMD5.c_str());
      
      if (calculatedMD5.equalsIgnoreCase(md5Header)) {
        if (Update.end(true)) {
          Serial.println("✅ OTA update success! Rebooting...");
          delay(1000);
          ESP.restart();
        } else {
          Serial.printf("❌ Update end failed: %s\n", Update.errorString());
        }
      } else {
        Serial.println("❌ MD5 verification failed!");
        Update.abort();
      }
    } else {
      Serial.println("❌ Not enough space for OTA!");
    }
  } else {
    Serial.printf("❌ HTTP error: %d\n", httpCode);
  }
  
  http.end();
}

void connectWiFi() {
  Serial.printf("📶 Connecting to WiFi: %s\n", ssid);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.printf("\n✅ WiFi connected! IP: %s\n", WiFi.localIP().toString().c_str());
}

void connectMQTT() {
  while (!client.connected()) {
    Serial.printf("📡 Connecting to MQTT: %s:%d\n", mqtt_server, mqtt_port);
    
    if (client.connect("ESP32_01", mqtt_user, mqtt_pass)) {
      Serial.println("✅ MQTT connected!");
      
      // Subscribe to topics
      client.subscribe(TOPIC_OTA);
      client.subscribe(TOPIC_BUZZER_TOGGLE);
      client.subscribe(TOPIC_BUZZER_BEEP);
      
      Serial.println("✅ Subscribed to OTA and Buzzer topics");
    } else {
      Serial.printf("❌ MQTT failed: %d. Retrying in 5s...\n", client.state());
      delay(5000);
    }
  }
}
```

### Firmware v1.0.0 vs v1.1.0

| Feature | v1.0.0 | v1.1.0 |
|---------|--------|--------|
| **Sensor Reading** | ✅ DHT22, MQ135, GP2Y1010AU0F | ✅ Same |
| **MQTT Publish** | ✅ Sensor data to `/data` topic | ✅ Same |
| **OTA Update** | ✅ With MD5 verification | ✅ **Fixed collectHeaders()** |
| **Buzzer Control** | ❌ **Permanently disabled** (digitalWrite LOW) | ✅ **Manual toggle + Auto-alarm** |
| **MQTT Subscribe** | ✅ `/ota` only | ✅ `/ota`, `/buzzer/toggle`, `/buzzer` |
| **Auto-Alarm** | ❌ No threshold detection | ✅ Beep if MQ135 > 600 or Dust > 50 |
| **Serial Banner** | 🔴 "FIRMWARE VERSION 1.0.0" | 🟢 "FIRMWARE VERSION 1.1.0" |

**Key Difference:** v1.0.0 có buzzer nhưng KHÔNG BAO GIỜ bật (always LOW). v1.1.0 cho phép toggle từ UI + tự động báo động.

---

## 🐛 Troubleshooting Guide

### Backend Issues

#### 1. MongoDB Connection Failed
```
❌ MongoDB connection error: failed to connect to server
```

**Giải pháp:**
- Kiểm tra `MONGO_URI` trong `.env` có đúng format không
- Whitelist IP address trong MongoDB Atlas Network Access
- Kiểm tra username/password trong connection string
- Test connection bằng MongoDB Compass
- Kiểm tra internet connection

#### 2. MQTT Broker Connection Failed
```
⚠️ MQTT client disconnected
```

**Giải pháp:**
- Kiểm tra `MQTT_BROKER_URL` và `MQTT_PORT` trong `.env`
- Xác nhận `MQTT_USERNAME` và `MQTT_PASSWORD` đúng
- Test bằng MQTT client (MQTT Explorer, MQTTX)
- Kiểm tra HiveMQ Cloud dashboard xem có giới hạn connection không
- Thử kết nối với `espClient.setInsecure()` (skip TLS verification)

#### 3. OpenAI API Error (AI Summary)
```
❌ OpenAI API Error: 401 Unauthorized
```

**Giải pháp:**
- Kiểm tra `OPENAI_API_KEY` trong `.env` có đúng không
- Verify API key còn hạn sử dụng và có credit
- Kiểm tra rate limit (3 requests/minute for free tier)
- Xem detailed error trong backend console
- **Fallback**: System sẽ tự động tạo summary đơn giản nếu API lỗi

#### 4. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Giải pháp:**
```powershell
# Tìm process sử dụng port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Hoặc đổi port trong .env
PORT=5001
```

---

### Frontend Issues

#### 5. Socket.IO Disconnected
```
🔌 Socket.IO disconnected from server
```

**Giải pháp:**
- Kiểm tra backend có chạy không (`http://localhost:5000`)
- Verify `FRONTEND_ORIGIN` trong backend `.env`
- Kiểm tra firewall/antivirus blocking port 5000
- Mở DevTools Console xem error chi tiết
- Restart cả backend và frontend

#### 6. API CORS Error
```
Access to fetch at 'http://localhost:5000/api/sensors' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Giải pháp:**
- Kiểm tra `FRONTEND_ORIGIN` trong backend `.env` có `http://localhost:5173`
- Verify proxy trong `vite.config.js`:
  ```javascript
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
  ```
- Clear browser cache và restart Vite dev server

#### 7. Chart Not Rendering
```
Chart is not defined
```

**Giải pháp:**
- Kiểm tra `react-chartjs-2` và `chart.js` đã cài đúng version
- Import đúng components trong `SensorChart.jsx`
- Register Chart.js components:
  ```javascript
  import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
  ```

---

### ESP32 Firmware Issues

#### 8. WiFi Connection Timeout
```
📶 Connecting to WiFi.........
❌ WiFi connection failed!
```

**Giải pháp:**
- Kiểm tra SSID và password trong firmware code
- Đảm bảo ESP32 trong phạm vi WiFi
- WiFi phải là 2.4GHz (ESP32 không hỗ trợ 5GHz)
- Kiểm tra WPA2 security (không hỗ trợ WPA3)
- Reset ESP32 và upload lại firmware

#### 9. MQTT Publish Failed
```
❌ MQTT publish failed!
```

**Giải pháp:**
- Kiểm tra MQTT broker URL và credentials trong code
- Verify topic name đúng format: `iot/devices/{deviceId}/data`
- Check payload size không quá lớn (max 256 bytes khuyến nghị)
- Kiểm tra QoS level (khuyến nghị: QoS 1)
- Monitor Serial output để xem connection status

#### 10. OTA Update MD5 Verification Failed
```
❌ MD5 verification failed!
🔐 Expected: 35462a113e9ae1a8dc9dbd750c85adaf
🔍 Calculated: 00000000000000000000000000000000
```

**Giải pháp (CRITICAL FIX):**
- **Root cause**: HTTPClient library cần `collectHeaders()` BEFORE `http.GET()`
- **Fix**: Thêm code này TRƯỚC `http.begin()`:
  ```cpp
  const char* headerKeys[] = {"X-MD5"};
  const size_t headerKeysCount = sizeof(headerKeys) / sizeof(char*);
  http.collectHeaders(headerKeys, headerKeysCount);
  
  http.begin(url);
  int httpCode = http.GET();
  String md5Header = http.header("X-MD5"); // Now works!
  ```
- Verify backend sends `X-MD5` header (test with curl)
- Compile và upload firmware mới với fix này

#### 11. Buzzer Not Responding (v1.1.0)
```
🔊 Buzzer toggle command received!
✅ Parsed state: 'on'
(But buzzer stays silent)
```

**Giải pháp:**
- Kiểm tra wiring: Buzzer VCC → 5V, GND → GND, Signal → GPIO 5
- Verify buzzer là **Active HIGH** (bật khi digitalWrite HIGH)
- Test buzzer trực tiếp với Arduino:
  ```cpp
  pinMode(5, OUTPUT);
  digitalWrite(5, HIGH); // Should beep
  delay(1000);
  digitalWrite(5, LOW);
  ```
- Kiểm tra Device ID trong Dashboard.jsx = "ESP32_01" (match MQTT topic)
- Check Serial Monitor xem có nhận MQTT message không

#### 12. Sensor Reading NaN
```
❌ DHT22 read failed! temperature: nan, humidity: nan
```

**Giải pháp:**
- Kiểm tra DHT22 wiring: VCC → 3.3V, GND → GND, DATA → GPIO 15
- Thêm pull-up resistor 10kΩ giữa DATA và VCC
- Tăng delay giữa các lần đọc (min 2 seconds)
- Thay DHT22 mới nếu vẫn lỗi
- Check `dht.begin()` được gọi trong `setup()`

---

### Database Issues

#### 13. Duplicate Key Error
```
E11000 duplicate key error collection: btl_iot.firmwares index: version_1 dup key: { version: "1.1.0" }
```

**Giải pháp:**
- Xóa firmware cũ trước khi upload version mới:
  ```javascript
  DELETE /api/firmware/:firmwareId
  ```
- Hoặc upload với version khác (e.g., "1.1.1")
- Check MongoDB Compass xem đã có version này chưa

#### 14. Slow Query Performance
```
⚠️ Query took 3.5s to execute
```

**Giải pháp:**
- Tạo indexes cho các fields thường query:
  ```javascript
  db.sensordatas.createIndex({ createdAt: -1 });
  db.sensordatas.createIndex({ deviceId: 1, createdAt: -1 });
  ```
- Giới hạn số lượng kết quả với `limit()` và `skip()` pagination
- Cleanup old data (sensor readings > 30 days)

---

### OTA Update Workflow Issues

#### 15. Trigger Update But ESP32 Not Responding
```
✅ OTA update command sent to device ESP32_01 via MQTT
(ESP32 Serial: không có gì)
```

**Giải pháp:**
- Verify ESP32 đã subscribe topic `/ota`:
  ```cpp
  client.subscribe("iot/devices/ESP32_01/ota");
  ```
- Check MQTT callback function xử lý OTA message đúng chưa
- Test publish trực tiếp bằng MQTT client:
  ```json
  Topic: iot/devices/ESP32_01/ota
  Payload: {"version":"1.1.0"}
  ```
- Monitor Serial output xem có nhận message không

#### 16. Firmware Download 404 Not Found
```
❌ HTTP error: 404
Firmware file not found
```

**Giải pháp:**
- Kiểm tra file tồn tại trong `backend/uploads/firmware/`
- Verify database record có `filePath` đúng
- Check permissions của thư mục uploads (chmod 755)
- Test download trực tiếp:
  ```powershell
  curl http://localhost:5000/api/firmware/download/1.1.0 --output test.bin
  ```

---

## 🚀 Production Deployment

### Build & Deploy Frontend

```powershell
# Build production bundle
cd C:\BTL-IoT\Source\frontend
npm run build

# Output: dist/ folder
```

**Deploy options:**
1. **Vercel** (Recommended)
   ```powershell
   npm i -g vercel
   vercel --prod
   ```

2. **Netlify**
   - Drag & drop `dist/` folder to Netlify
   - Set build command: `npm run build`
   - Publish directory: `dist`

3. **Static hosting** (Apache/Nginx)
   - Copy `dist/` to `/var/www/html/`
   - Configure reverse proxy to backend API

**Environment variables:**
- Update `src/config.js` với production API URL:
  ```javascript
  export const API_URL = "https://your-backend.com/api";
  ```

---

### Deploy Backend (Node.js)

#### Option 1: PM2 Process Manager
```bash
# Install PM2
npm install -g pm2

# Start application
cd C:\BTL-IoT\Source\backend
pm2 start src/server.js --name btl-iot-backend

# Save process list
pm2 save

# Auto-start on boot
pm2 startup

# Monitor logs
pm2 logs btl-iot-backend
```

#### Option 2: Docker Container
**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/firmware

EXPOSE 5000

CMD ["node", "src/server.js"]
```

**Build & Run:**
```powershell
docker build -t btl-iot-backend .
docker run -d -p 5000:5000 --env-file .env btl-iot-backend
```

#### Option 3: Cloud Platforms

**Heroku:**
```powershell
heroku create btl-iot-backend
git push heroku main
heroku config:set MONGO_URI=mongodb+srv://...
```

**Railway:**
- Connect GitHub repository
- Auto-deploy on push
- Set environment variables in dashboard

**Render:**
- Create new Web Service
- Build command: `npm install`
- Start command: `node src/server.js`

---

### Production Environment Variables

Update `.env` for production:
```env
NODE_ENV=production
PORT=5000
BACKEND_URL=https://your-backend.com

# Use production MongoDB Atlas cluster
MONGO_URI=mongodb+srv://<prod-user>:<prod-password>@<prod-cluster>.mongodb.net/<prod-db>?retryWrites=true&w=majority

# CORS origin (frontend production URL)
FRONTEND_ORIGIN=https://your-frontend.vercel.app

# Strong JWT secret (generate với: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-production-secret-key-256-bit

# OpenAI production key
OPENAI_API_KEY=sk-prod-...

# MQTT production broker (consider dedicated instance)
MQTT_BROKER_URL=mqtts://prod-cluster.s1.eu.hivemq.cloud
MQTT_USERNAME=prod-esp32-system
MQTT_PASSWORD=StrongProductionPassword123!
```

---

### Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT_SECRET (min 256-bit)
- [ ] Enable HTTPS/TLS for all connections
- [ ] Set CORS to specific frontend origin (no wildcard `*`)
- [ ] Use environment variables (never commit `.env`)
- [ ] Enable MongoDB authentication
- [ ] Use MQTT TLS (port 8883, not 1883)
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Sanitize user inputs
- [ ] Enable helmet middleware for security headers
- [ ] Regular dependency updates (`npm audit fix`)
- [ ] Implement logging and monitoring

---

## 📦 Dependencies

### Backend (`Source/backend/package.json`)

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0",
    "mqtt": "^5.3.0",
    "multer": "^1.4.5-lts.1",
    "node-cron": "^3.0.3",
    "openai": "^4.20.0",
    "socket.io": "^4.7.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

### Frontend (`Source/frontend/package.json`)

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "chart.js": "^4.4.0",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "socket.io-client": "^4.7.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

---

## 📝 NPM Scripts

### Backend (`Source/backend/package.json`)

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "echo \"No tests specified\"",
    "lint": "eslint src/**/*.js"
  }
}
```

**Usage:**
```powershell
npm start      # Production mode
npm run dev    # Development mode với auto-restart
```

---

### Frontend (`Source/frontend/package.json`)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx"
  }
}
```

**Usage:**
```powershell
npm run dev      # Start dev server (localhost:5173)
npm run build    # Build for production → dist/
npm run preview  # Preview production build
```

---

## 🧪 Testing

### Manual Testing Checklist

#### Backend API Testing

```powershell
# Test sensor data endpoint
curl http://localhost:5000/api/sensors

# Test realtime data
curl http://localhost:5000/api/sensors/realtime

# Test login
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"admin123\"}'

# Test firmware download (verify X-MD5 header)
curl http://localhost:5000/api/firmware/download/1.1.0 --output test.bin -v
```

#### MQTT Testing

Use **MQTT Explorer** or **MQTTX**:

1. Connect to HiveMQ Cloud:
   - Host: `your-cluster.s1.eu.hivemq.cloud`
   - Port: 8883 (TLS)
   - Username: `esp32-air-system`
   - Password: `YourPassword123`

2. Subscribe to topics:
   - `iot/devices/+/data`
   - `iot/devices/+/status`

3. Publish test message:
   ```json
   Topic: iot/devices/ESP32_01/data
   Payload: {"temperature":25.5,"humidity":60,"mq135":400,"dust":30}
   ```

4. Verify backend receives and saves to MongoDB

#### Socket.IO Testing

Open browser DevTools Console:

```javascript
// Connect to Socket.IO
const socket = io('http://localhost:5000');

// Listen for sensor updates
socket.on('sensor:update', (data) => {
  console.log('Received:', data);
});

// Check connection status
socket.connected // Should be true
```

#### ESP32 OTA Testing

1. Upload firmware v1.0.0 qua USB
2. Serial Monitor check firmware version banner
3. Trigger OTA update v1.1.0 từ UI
4. Monitor Serial:
   ```
   🔄 Starting OTA update to v1.1.0
   📦 File size: 1073216 bytes
   🔐 Expected MD5: 35462a113e9ae1a8dc9dbd750c85adaf
   📥 Downloaded: 1073216/1073216 bytes
   🔍 Calculated MD5: 35462a113e9ae1a8dc9dbd750c85adaf
   ✅ MD5 verification passed!
   ✅ OTA update success! Rebooting...
   🟢🟢🟢 FIRMWARE VERSION 1.1.0 🟢🟢🟢
   ```
5. Test buzzer toggle từ Dashboard
6. Verify còi bật/tắt đúng

---

## 🔗 Useful Links

### Documentation
- **MongoDB**: https://docs.mongodb.com/
- **Express.js**: https://expressjs.com/
- **React**: https://react.dev/
- **Socket.IO**: https://socket.io/docs/
- **MQTT**: https://mqtt.org/
- **ESP32 Arduino**: https://docs.espressif.com/projects/arduino-esp32/

### Tools
- **MongoDB Compass**: https://www.mongodb.com/products/compass
- **MQTT Explorer**: http://mqtt-explorer.com/
- **Postman**: https://www.postman.com/
- **Arduino IDE**: https://www.arduino.cc/en/software

### Libraries
- **PubSubClient** (ESP32 MQTT): https://github.com/knolleary/pubsubclient
- **ArduinoJson**: https://arduinojson.org/
- **Chart.js**: https://www.chartjs.org/
- **React Router**: https://reactrouter.com/

---

## 🤝 Contributing

### Git Workflow

```powershell
# Clone repository
git clone https://github.com/your-username/BTL-IoT.git
cd BTL-IoT

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add: your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Code Style Guidelines

**Backend (JavaScript):**
- Use `const` for constants, `let` for variables
- Async/await for asynchronous operations
- Error handling with try-catch blocks
- Meaningful variable names (camelCase)

**Frontend (React/JSX):**
- Functional components with hooks
- PropTypes for type checking
- Component naming: PascalCase
- CSS modules or styled-components

**ESP32 (C++):**
- Snake_case for variables
- UPPER_CASE for constants
- Descriptive function names
- Comment complex logic
- Use Serial prints for debugging

---

## 📧 Support & Contact

**Developers:**
- Email: your-email@example.com
- GitHub Issues: https://github.com/your-username/BTL-IoT/issues

**Documentation:**
- Full Demo Guide: `Documents/FULL_DEMO_GUIDE.md`
- OTA Update Guide: `Documents/OTA_DEMO_GUIDE.md`

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** - AI-powered summaries
- **HiveMQ** - Cloud MQTT broker
- **MongoDB Atlas** - Cloud database
- **ESP32 Community** - Arduino libraries and documentation
- **React Community** - UI components and tools

---

## 📚 Additional Resources

### OTA Update Workflow

```mermaid
sequenceDiagram
    participant Admin as Admin UI
    participant Backend as Backend API
    participant MQTT as MQTT Broker
    participant ESP32 as ESP32 Device

    Admin->>Backend: Upload firmware v1.1.0.bin
    Backend->>Backend: Calculate MD5 hash
    Backend->>Backend: Save to uploads/firmware/
    Backend->>Backend: Create MongoDB record

    Admin->>Backend: Trigger OTA (deviceId, version)
    Backend->>MQTT: Publish iot/devices/ESP32_01/ota
    MQTT->>ESP32: {"version":"1.1.0"}

    ESP32->>Backend: GET /api/firmware/download/1.1.0
    Backend->>ESP32: Binary stream + X-MD5 header
    ESP32->>ESP32: Download & calculate MD5
    ESP32->>ESP32: Verify MD5 match
    ESP32->>ESP32: Flash firmware with Update.write()
    ESP32->>ESP32: Reboot with new firmware
    ESP32->>MQTT: Publish status (online, v1.1.0)
```

### Sensor Data Flow

```mermaid
flowchart LR
    A[ESP32 Sensors] -->|Read every 10s| B[ESP32 Firmware]
    B -->|JSON Payload| C[MQTT Broker]
    C -->|Subscribe| D[Backend MQTT Client]
    D -->|Parse & Save| E[MongoDB]
    D -->|Emit Event| F[Socket.IO]
    F -->|Realtime Update| G[Frontend Dashboard]
    E -->|API Request| H[Frontend History]
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant MongoDB

    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /api/auth/login
    Backend->>MongoDB: Find user by username
    MongoDB->>Backend: User document
    Backend->>Backend: bcrypt.compare(password, hash)
    Backend->>Backend: jwt.sign(payload, secret)
    Backend->>Frontend: { token, user }
    Frontend->>Frontend: Store token in localStorage
    Frontend->>Frontend: Set Authorization header
    Frontend->>Frontend: Redirect to /dashboard
```

---

## 🎯 Roadmap

### Version 2.0 (Future)
- [ ] Multi-language support (EN/VI)
- [ ] Email notifications for air quality alerts
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Export data to CSV/PDF
- [ ] User activity logs
- [ ] Two-factor authentication (2FA)
- [ ] Webhook integration
- [ ] Historical data visualization (time-series graphs)
- [ ] Predictive air quality forecasting (ML)

### ESP32 Firmware v2.0
- [ ] Support multiple sensors per device
- [ ] Local data buffering (SD card)
- [ ] WiFi auto-reconnect with exponential backoff
- [ ] Configurable sampling intervals
- [ ] OTA rollback on boot failure
- [ ] Sleep mode for battery operation
- [ ] BLE configuration interface

---

**Built with ❤️ by BTL-IoT Team**

**Last Updated:** January 2025

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

### Tính Năng Đã Triển Khai ✅

- ✅ **Real-time Dashboard** với Socket.IO
- ✅ **AI Summary theo giờ** (OpenAI GPT-4o-mini)
- ✅ **Authentication & Authorization** (JWT + Role-based)
- ✅ **Device Management** (CRUD + Worker Assignment)
- ✅ **User Management** (CRUD + Role Management)
- ✅ **OTA Firmware Update** (Upload, Trigger, Auto-update)
- ✅ **Scheduled Jobs** (Hourly AI Summary)
- ✅ **Fallback Mechanism** (Khi OpenAI API lỗi)
- ✅ **Data Validation** (MQTT, API, Form)
- ✅ **Error Handling** (Global error handler)

### Tính Năng Có Thể Thêm 🔮

- 📧 Email/SMS notifications khi AQI vượt ngưỡng
- 📊 Export dữ liệu CSV/Excel
- 🗺️ Bản đồ nhiệt (heatmap) theo thời gian
- 🌍 Đa ngôn ngữ (i18n)
- 📱 Mobile app (React Native)
- 🤖 AI Summary theo ngày/tuần/tháng
- 📈 Dự đoán xu hướng (Machine Learning)
- 🔔 Push notifications cho mobile
- 📸 Dashboard screenshots & reports
- 🏢 Multi-tenant support (nhiều công ty)

### Cải Tiến Kỹ Thuật 🛠️

- ⚡ Redis cache cho API performance
- 🚦 Rate limiting để chống spam
- 📊 Data aggregation (hourly/daily averages)
- 🧪 Unit tests & Integration tests
- 🔄 CI/CD pipeline (GitHub Actions)
- 📊 Monitoring & Logging (ELK stack, Prometheus)
- 🐳 Docker & Docker Compose
- ☸️ Kubernetes deployment
- 🔒 HTTPS/TLS encryption
- 🔐 OAuth2 social login

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
- ✅ AI-powered analysis (OpenAI GPT-4o-mini)
- ✅ Lưu trữ lịch sử dài hạn
- ✅ Authentication & Role-based access control
- ✅ Device & User management
- ✅ OTA firmware update từ xa
- ✅ Giao diện trực quan, dễ sử dụng
- ✅ Kiến trúc mở rộng được
- ✅ Code sạch, có cấu trúc

---

## 🎬 Hướng Dẫn Demo Nhanh

### 1. Demo Real-time Monitoring (3 phút)
1. Login Admin/Worker
2. Xem Dashboard realtime
3. Quan sát charts tự động cập nhật mỗi 2 giây
4. Giải thích AQI levels (Good/Moderate/Unhealthy)

### 2. Demo AI Summary (2 phút)
1. Click nút **🤖 AI Summary**
2. Xem phân tích AI của 1 giờ gần nhất
3. Giải thích cấu trúc summary:
   - Nhận xét tổng quan
   - Đánh giá chi tiết (nhiệt độ, độ ẩm, AQI, PM2.5)
   - Xu hướng & dấu hiệu
   - Khuyến nghị an toàn
   - Kết luận

### 3. Demo Device Management (3 phút) - Admin Only
1. Vào Admin Panel (**🛠️ Thiết bị**)
2. Thêm device mới (deviceId, name, location, MAC, IP)
3. Assign workers cho device
4. Sửa device info
5. Xóa device
6. Login Worker → Chỉ thấy devices được assign

### 4. Demo User Management (2 phút) - Admin Only
1. Vào User Management (**👥 Người dùng**)
2. Xem danh sách users với device count
3. Filter users (All/Admin/Worker)
4. Search users
5. Edit user role (Worker → Admin)
6. Delete user

### 5. Demo OTA Firmware Update (5 phút) - Admin Only
1. **Chuẩn bị:**
   - Build 2 firmware versions (v1.0.0, v1.1.0) từ Arduino IDE
   - Flash v1.0.0 lên ESP32 qua USB
   
2. **Upload Firmware:**
   - Click **🔄 OTA** → **⬆️ Upload Firmware**
   - Upload file v1.1.0.bin
   - Nhập version, release notes
   
3. **Trigger Update:**
   - Click **🚀 Trigger OTA** → Chọn device → Update
   
4. **Observe ESP32:**
   - Mở Serial Monitor
   - Theo dõi: Download → Verify MD5 → Flash → Reboot
   - ESP32 boot với version 1.1.0

### 6. Demo Role-based Access (2 phút)
1. Login Admin → Có tất cả nút (Thiết bị, Người dùng, OTA)
2. Logout → Login Worker → Chỉ thấy Dashboard & History
3. Worker chỉ thấy devices được assign

---

