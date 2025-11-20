/*
 * ESP32 OTA Firmware Update Integration
 * 
 * HƯỚNG DẪN TÍCH HỢP VÀO CODE ESP32 HIỆN TẠI:
 * 
 * 1. THÊM THƯVIỆN:
 *    - #include <HTTPClient.h>
 *    - #include <Update.h>
 * 
 * 2. THÊM BIẾN GLOBAL:
 *    - const char* firmwareVersion = "1.0.0";  // Version hiện tại
 *    - const char* otaServerUrl = "http://YOUR_SERVER_IP:5000/api/firmware";
 *    - unsigned long lastOTACheck = 0;
 *    - const unsigned long otaCheckInterval = 3600000; // 1 giờ
 * 
 * 3. THÊM VÀO setup():
 *    - Serial.println("Firmware Version: " + String(firmwareVersion));
 *    - checkForOTAUpdate(); // Check ngay khi boot
 * 
 * 4. THÊM VÀO loop():
 *    - if (millis() - lastOTACheck >= otaCheckInterval) {
 *        checkForOTAUpdate();
 *        lastOTACheck = millis();
 *      }
 *    - handleMQTTOTA(); // Xử lý OTA trigger từ server
 * 
 * 5. SUBSCRIBE MQTT TOPIC:
 *    - client.subscribe("iot/devices/ESP32_001/ota");
 */

#include <HTTPClient.h>
#include <Update.h>

// ============================================
// CONSTANTS
// ============================================
const char* FIRMWARE_VERSION = "1.0.0";  // ⚠️ CẬP NHẬT VERSION KHI BUILD FIRMWARE MỚI
const char* OTA_SERVER_URL = "http://192.168.1.100:5000/api/firmware";  // ⚠️ ĐỔI IP SERVER
const char* DEVICE_ID = "ESP32_001";  // ⚠️ ĐỔI THEO DEVICE_ID CỦA BẠN

unsigned long lastOTACheck = 0;
const unsigned long OTA_CHECK_INTERVAL = 3600000;  // 1 giờ

// ============================================
// FUNCTION: CHECK FOR OTA UPDATE
// ============================================
void checkForOTAUpdate() {
  Serial.println("\n🔍 Checking for OTA update...");
  Serial.println("Current firmware version: " + String(FIRMWARE_VERSION));

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected. Skip OTA check.");
    return;
  }

  HTTPClient http;
  String url = String(OTA_SERVER_URL) + "/latest?current=" + String(FIRMWARE_VERSION);
  
  http.begin(url);
  int httpCode = http.GET();

  if (httpCode == 200) {
    String payload = http.getString();
    Serial.println("Server response: " + payload);

    // Parse JSON (cần thư viện ArduinoJson)
    // Hoặc parse đơn giản:
    if (payload.indexOf("\"hasUpdate\":true") > 0) {
      Serial.println("✅ New firmware available!");
      
      // Tìm downloadUrl
      int urlStart = payload.indexOf("\"downloadUrl\":\"") + 15;
      int urlEnd = payload.indexOf("\"", urlStart);
      String downloadUrl = payload.substring(urlStart, urlEnd);

      // Tìm MD5 hash
      int md5Start = payload.indexOf("\"md5Hash\":\"") + 11;
      int md5End = payload.indexOf("\"", md5Start);
      String md5Hash = payload.substring(md5Start, md5End);

      Serial.println("Download URL: " + downloadUrl);
      Serial.println("Expected MD5: " + md5Hash);

      // Bắt đầu download và flash
      performOTAUpdate(downloadUrl, md5Hash);
    } else {
      Serial.println("ℹ️ Already running latest firmware.");
    }
  } else {
    Serial.println("❌ HTTP Error: " + String(httpCode));
  }

  http.end();
}

// ============================================
// FUNCTION: PERFORM OTA UPDATE
// ============================================
void performOTAUpdate(String url, String expectedMD5) {
  Serial.println("\n📥 Starting OTA update...");

  HTTPClient http;
  http.begin(url);
  int httpCode = http.GET();

  if (httpCode != 200) {
    Serial.println("❌ Download failed: " + String(httpCode));
    http.end();
    return;
  }

  int contentLength = http.getSize();
  Serial.println("Firmware size: " + String(contentLength) + " bytes");

  // Check if enough space
  if (contentLength <= 0 || !Update.begin(contentLength)) {
    Serial.println("❌ Not enough space for OTA update");
    http.end();
    return;
  }

  // Set MD5 for verification
  Update.setMD5(expectedMD5.c_str());

  // Get stream
  WiFiClient* stream = http.getStreamPtr();
  size_t written = 0;
  uint8_t buff[128] = { 0 };

  Serial.println("⬇️ Downloading firmware...");

  while (http.connected() && (written < contentLength)) {
    size_t available = stream->available();
    if (available) {
      int c = stream->readBytes(buff, ((available > sizeof(buff)) ? sizeof(buff) : available));
      Update.write(buff, c);
      written += c;

      // Print progress
      int progress = (written * 100) / contentLength;
      if (progress % 10 == 0) {
        Serial.println("Progress: " + String(progress) + "%");
      }
    }
    delay(1);
  }

  Serial.println("📦 Downloaded: " + String(written) + " / " + String(contentLength) + " bytes");

  if (Update.end()) {
    if (Update.isFinished()) {
      Serial.println("✅ OTA update SUCCESS!");
      Serial.println("🔄 Rebooting in 3 seconds...");
      delay(3000);
      ESP.restart();
    } else {
      Serial.println("❌ OTA update FAILED (not finished)");
    }
  } else {
    Serial.println("❌ OTA update FAILED");
    Serial.println("Error: " + String(Update.getError()));
  }

  http.end();
}

// ============================================
// FUNCTION: HANDLE MQTT OTA TRIGGER
// Gọi hàm này trong MQTT callback khi nhận message trên topic "iot/devices/ESP32_001/ota"
// ============================================
void handleMQTTOTA(String payload) {
  Serial.println("\n📡 MQTT OTA trigger received!");
  Serial.println("Payload: " + payload);

  // Parse JSON
  if (payload.indexOf("\"command\":\"update\"") > 0) {
    // Tìm downloadUrl
    int urlStart = payload.indexOf("\"downloadUrl\":\"") + 15;
    int urlEnd = payload.indexOf("\"", urlStart);
    String downloadUrl = payload.substring(urlStart, urlEnd);

    // Tìm MD5
    int md5Start = payload.indexOf("\"md5Hash\":\"") + 11;
    int md5End = payload.indexOf("\"", md5Start);
    String md5Hash = payload.substring(md5Start, md5End);

    Serial.println("🎯 Triggering OTA update...");
    performOTAUpdate(downloadUrl, md5Hash);
  }
}

// ============================================
// MQTT CALLBACK INTEGRATION (THÊM VÀO CODE CỦA BẠN)
// ============================================
/*
void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.println("MQTT message received on topic: " + String(topic));

  // XỬ LÝ OTA TOPIC
  if (String(topic) == "iot/devices/" + String(DEVICE_ID) + "/ota") {
    handleMQTTOTA(message);
  }
  
  // ... các topic khác của bạn ...
}
*/

// ============================================
// SETUP & LOOP INTEGRATION
// ============================================
/*
void setup() {
  Serial.begin(115200);
  
  // ... WiFi setup ...
  
  Serial.println("📱 Device ID: " + String(DEVICE_ID));
  Serial.println("📦 Firmware Version: " + String(FIRMWARE_VERSION));
  
  // Subscribe OTA topic
  String otaTopic = "iot/devices/" + String(DEVICE_ID) + "/ota";
  client.subscribe(otaTopic.c_str());
  Serial.println("📡 Subscribed to OTA topic: " + otaTopic);
  
  // Check for update on boot
  checkForOTAUpdate();
  
  // ... rest of setup ...
}

void loop() {
  // ... MQTT loop, sensor reading ...
  
  // Periodic OTA check (mỗi 1 giờ)
  if (millis() - lastOTACheck >= OTA_CHECK_INTERVAL) {
    checkForOTAUpdate();
    lastOTACheck = millis();
  }
  
  // ... rest of loop ...
}
*/

// ============================================
// TEST FUNCTIONS (CHO DEBUG)
// ============================================
void printOTAInfo() {
  Serial.println("\n=== OTA INFO ===");
  Serial.println("Device ID: " + String(DEVICE_ID));
  Serial.println("Current Version: " + String(FIRMWARE_VERSION));
  Serial.println("OTA Server: " + String(OTA_SERVER_URL));
  Serial.println("Check Interval: " + String(OTA_CHECK_INTERVAL / 1000) + " seconds");
  Serial.println("================\n");
}
