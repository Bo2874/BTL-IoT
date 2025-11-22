#include <DHT.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Update.h>
#include <MD5Builder.h>
#include "time.h"

// ===== FIRMWARE VERSION =====
const char* FIRMWARE_VERSION = "1.1.0";  // 🟢 PHIÊN BẢN 1.1.0 - CÓ TÍNH NĂNG CÒI CẢNH BÁO!

#define DHTPIN 15
#define DHTTYPE DHT11

#define MQ135_AO 32  // Ngõ ra analog MQ135 (AO)
#define MQ135_DO 33  // Ngõ ra digital MQ135 (DO)
#define DUST_LED_PIN 4   // LED control GP2Y1010AU0F (chân 3)
#define DUST_AO_PIN 35    // Vo cảm biến GP2Y1010AU0F (chân 5)

// 🆕 TÍNH NĂNG MỚI: Còi cảnh báo
#define BUZZER_PIN 14    // Chân còi D14 (GPIO 14)

// 🆕 Ngưỡng cảnh báo
#define TEMP_THRESHOLD 35.0      // Nhiệt độ > 35°C
#define HUMIDITY_THRESHOLD 80.0  // Độ ẩm > 80%
#define AQI_THRESHOLD 150.0      // AQI > 150 (ô nhiễm nhẹ)
#define DUST_THRESHOLD 200.0     // Bụi > 200 µg/m³

// ===== WIFI & MQTT CONFIGURATION =====
const char* ssid = "AndroidAPE8B4"; // Wifi-Name
const char* password = "123456789"; // password

const char* mqtt_server = "3c86c6e739d544f99df58aac160e686f.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "esp32-air-system";
const char* mqtt_pass = "Airsystem12345";

// ===== DEVICE CONFIGURATION =====
const char* DEVICE_ID = "ESP32_01";  // ✅ DEVICE ID THỰC TẾ TỪ MONGODB

// ===== OTA CONFIGURATION =====
const char* OTA_SERVER_URL = "http://192.168.142.221:5000"; // ⚠️ ĐÃ CẬP NHẬT IP MỚI
unsigned long lastOTACheck = 0;
const unsigned long OTA_CHECK_INTERVAL = 3600000; // Kiểm tra mỗi 1 giờ

const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 7 * 3600; // Việt Nam GMT+7
const int daylightOffset_sec = 0;

const char* hiveMQ_CA_cert = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIFBjCCAu6gAwIBAgIRAMISMktwqbSRcdxA9+KFJjwwDQYJKoZIhvcNAQELBQAw\n" \
"TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh\n" \
"cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMjQwMzEzMDAwMDAw\n" \
"WhcNMjcwMzEyMjM1OTU5WjAzMQswCQYDVQQGEwJVUzEWMBQGA1UEChMNTGV0J3Mg\n" \
"RW5jcnlwdDEMMAoGA1UEAxMDUjEyMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB\n" \
"CgKCAQEA2pgodK2+lP474B7i5Ut1qywSf+2nAzJ+Npfs6DGPpRONC5kuHs0BUT1M\n" \
"5ShuCVUxqqUiXXL0LQfCTUA83wEjuXg39RplMjTmhnGdBO+ECFu9AhqZ66YBAJpz\n" \
"kG2Pogeg0JfT2kVhgTU9FPnEwF9q3AuWGrCf4yrqvSrWmMebcas7dA8827JgvlpL\n" \
"Thjp2ypzXIlhZZ7+7Tymy05v5J75AEaz/xlNKmOzjmbGGIVwx1Blbzt05UiDDwhY\n" \
"XS0jnV6j/ujbAKHS9OMZTfLuevYnnuXNnC2i8n+cF63vEzc50bTILEHWhsDp7CH4\n" \
"WRt/uTp8n1wBnWIEwii9Cq08yhDsGwIDAQABo4H4MIH1MA4GA1UdDwEB/wQEAwIB\n" \
"hjAdBgNVHSUEFjAUBggrBgEFBQcDAgYIKwYBBQUHAwEwEgYDVR0TAQH/BAgwBgEB\n" \
"/wIBADAdBgNVHQ4EFgQUALUp8i2ObzHom0yteD763OkM0dIwHwYDVR0jBBgwFoAU\n" \
"ebRZ5nu25eQBc4AIiMgaWPbpm24wMgYIKwYBBQUHAQEEJjAkMCIGCCsGAQUFBzAC\n" \
"hhZodHRwOi8veDEuaS5sZW5jci5vcmcvMBMGA1UdIAQMMAowCAYGZ4EMAQIBMCcG\n" \
"A1UdHwQgMB4wHKAaoBiGFmh0dHA6Ly94MS5jLmxlbmNyLm9yZy8wDQYJKoZIhvcN\n" \
"AQELBQADggIBAI910AnPanZIZTKS3rVEyIV29BWEjAK/duuz8eL5boSoVpHhkkv3\n" \
"4eoAeEiPdZLj5EZ7G2ArIK+gzhTlRQ1q4FKGpPPaFBSpqV/xbUb5UlAXQOnkHn3m\n" \
"FVj+qYv87/WeY+Bm4sN3Ox8BhyaU7UAQ3LeZ7N1X01xxQe4wIAAE3JVLUCiHmZL+\n" \
"qoCUtgYIFPgcg350QMUIWgxPXNGEncT921ne7nluI02V8pLUmClqXOsCwULw+PVO\n" \
"ZCB7qOMxxMBoCUeL2Ll4oMpOSr5pJCpLN3tRA2s6P1KLs9TSrVhOk+7LX28NMUlI\n" \
"usQ/nxLJID0RhAeFtPjyOCOscQBA53+NRjSCak7P4A5jX7ppmkcJECL+S0i3kXVU\n" \
"y5Me5BbrU8973jZNv/ax6+ZK6TM8jWmimL6of6OrX7ZU6E2WqazzsFrLG3o2kySb\n" \
"zlhSgJ81Cl4tv3SbYiYXnJExKQvzf83DYotox3f0fwv7xln1A2ZLplCb0O+l/AK0\n" \
"YE0DS2FPxSAHi0iwMfW2nNHJrXcY3LLHD77gRgje4Eveubi2xxa+Nmk/hmhLdIET\n" \
"iVDFanoCrMVIpQ59XWHkzdFmoHXHBV7oibVjGSO7ULSQ7MJ1Nz51phuDJSgAIU7A\n" \
"0zrLnOrAj/dfrlEWRhCvAgbuwLZX1A2sjNjXoPOHbsPiy+lO1KF8/XY7\n" \
"-----END CERTIFICATE-----\n";

WiFiClientSecure espClient;
PubSubClient client(espClient);

DHT dht(DHTPIN, DHTTYPE);

// --- Cấu hình trung bình di động MQ135 ---
#define MQ135_SAMPLES 5
float mq135_buffer[MQ135_SAMPLES] = {0};
int mq135_index = 0;
bool mq135_full = false;

// 🆕 Biến trạng thái còi
bool isAlarmActive = false;
bool buzzerManualOn = false; // Còi bật thủ công từ web

// --- Hàm kết nối WiFi ---
void setup_wifi() {
  delay(10);
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
}

// --- Hàm kết nối MQTT ---
void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP32_Client", mqtt_user, mqtt_pass)) {
      Serial.println("connected");
      Serial.println("\n🔔 ========== SUBSCRIBING TO TOPICS ==========");
      
      // Subscribe to OTA topic
      String otaTopic = "iot/devices/" + String(DEVICE_ID) + "/ota";
      bool ota_sub = client.subscribe(otaTopic.c_str());
      Serial.printf("📬 OTA Topic: %s [%s]\n", otaTopic.c_str(), ota_sub ? "✅ OK" : "❌ FAIL");
      
      // 🆕 Subscribe to Buzzer topic
      String buzzerTopic = "iot/devices/" + String(DEVICE_ID) + "/buzzer";
      bool buzzer_sub = client.subscribe(buzzerTopic.c_str());
      Serial.printf("📬 Buzzer Topic: %s [%s]\n", buzzerTopic.c_str(), buzzer_sub ? "✅ OK" : "❌ FAIL");
      
      // 🆕 Subscribe to Buzzer Toggle topic
      String buzzerToggleTopic = "iot/devices/" + String(DEVICE_ID) + "/buzzer/toggle";
      bool toggle_sub = client.subscribe(buzzerToggleTopic.c_str());
      Serial.printf("📬 Buzzer Toggle Topic: %s [%s]\n", buzzerToggleTopic.c_str(), toggle_sub ? "✅ OK" : "❌ FAIL");
      
      Serial.println("=============================================\n");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

// --- MQTT Callback cho OTA và Buzzer ---
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.printf("\n📨 ========== MQTT MESSAGE RECEIVED ==========\n");
  Serial.printf("📍 Topic: %s\n", topic);
  Serial.printf("📏 Length: %d bytes\n", length);
  
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.printf("📋 Message: %s\n", message.c_str());
  Serial.println("============================================");
  
  // Kiểm tra nếu là lệnh OTA
  String otaTopic = "iot/devices/" + String(DEVICE_ID) + "/ota";
  if (String(topic) == otaTopic) {
    Serial.println("🔄 OTA update command received!");
    
    // Parse JSON để lấy version
    int versionStart = message.indexOf("\"version\":\"") + 11;
    int versionEnd = message.indexOf("\"", versionStart);
    String targetVersion = message.substring(versionStart, versionEnd);
    
    Serial.printf("📦 Target version: %s\n", targetVersion.c_str());
    performOTAUpdate(targetVersion);
    return;
  }
  
  // 🆕 Kiểm tra nếu là lệnh BẬT/TẮT còi liên tục
  String buzzerToggleTopic = "iot/devices/" + String(DEVICE_ID) + "/buzzer/toggle";
  if (String(topic) == buzzerToggleTopic) {
    Serial.println("🔊 Buzzer toggle command received!");
    Serial.println("📋 Raw Payload: " + message);
    
    // Parse JSON để lấy state (có thể có "action" field)
    int stateStart = message.indexOf("\"state\":\"");
    Serial.printf("🔍 indexOf result: %d\n", stateStart);
    
    if (stateStart >= 0) {  // Tìm thấy "state"
      stateStart += 9; // Skip "state":"
      int stateEnd = message.indexOf("\"", stateStart);
      String state = message.substring(stateStart, stateEnd);
      
      Serial.printf("✅ Parsed state: '%s' (length: %d)\n", state.c_str(), state.length());
      Serial.printf("🔍 Comparing: state='%s' vs 'on'\n", state.c_str());
      
      if (state == "on") {
        buzzerManualOn = true;
        digitalWrite(BUZZER_PIN, HIGH); // Bật còi liên tục (Active HIGH)
        Serial.println("🔊 Còi đã BẬT liên tục!");
      } else if (state == "off") {
        buzzerManualOn = false;
        digitalWrite(BUZZER_PIN, LOW); // Tắt còi (Active HIGH)
        Serial.println("🔇 Còi đã TẮT!");
      } else {
        Serial.printf("⚠️ Unknown state: '%s'\n", state.c_str());
      }
    } else {
      Serial.println("❌ Could not find 'state' field in JSON!");
    }
    return;
  }
  
  // 🆕 Kiểm tra nếu là lệnh kích hoạt còi (beep N lần)
  String buzzerTopic = "iot/devices/" + String(DEVICE_ID) + "/buzzer";
  if (String(topic) == buzzerTopic) {
    Serial.println("🔊 Buzzer trigger command received!");
    
    // Parse JSON để lấy duration (số lần beep)
    int duration = 3; // Mặc định 3 beep
    
    // Tìm "duration": trong JSON string
    int durationIndex = message.indexOf("\"duration\":");
    if (durationIndex >= 0) {
      String durationStr = message.substring(durationIndex + 11); // Bỏ qua "duration":
      duration = durationStr.toInt();
      if (duration < 1) duration = 1;
      if (duration > 10) duration = 10; // Giới hạn tối đa 10 beep
    }
    
    Serial.printf("🔊 Activating buzzer: %d beeps\n", duration);
    activateBuzzer(duration, 300); // Kêu với duration beep, mỗi beep 300ms
  }
}

// Hàm lấy thời gian gửi/đo
String getDateTime(){
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    return "00:00:00";
  }
  char buf[25];
  strftime(buf, sizeof(buf), "%d/%m/%Y %H:%M:%S", &timeinfo);
  return String(buf);
}

// 🆕 Hàm kích hoạt còi cảnh báo (ACTIVE HIGH - ĐÃ FIX!)
void activateBuzzer(int times, int duration_ms) {
  for (int i = 0; i < times; i++) {
    digitalWrite(BUZZER_PIN, HIGH);  // Bật còi (Active HIGH)
    delay(duration_ms);
    digitalWrite(BUZZER_PIN, LOW);   // Tắt còi (Active HIGH)
    if (i < times - 1) delay(duration_ms / 2);  // Nghỉ giữa các tiếng beep
  }
}

// 🆕 Hàm kiểm tra ngưỡng và kích hoạt còi
void checkThresholdsAndAlarm(float temp, float hum, float aqi, float dust_ug) {
  // Nếu còi đang bật thủ công, không kiểm tra ngưỡng tự động
  if (buzzerManualOn) {
    return; // Còi đã bật thủ công, bỏ qua alarm tự động
  }
  
  bool shouldAlarm = false;
  String alarmReasons = "";
  
  // Kiểm tra nhiệt độ
  if (temp > TEMP_THRESHOLD) {
    shouldAlarm = true;
    alarmReasons += "⚠️ NHIỆT ĐỘ CAO: " + String(temp, 1) + "°C (>" + String(TEMP_THRESHOLD, 0) + "°C)\n";
  }
  
  // Kiểm tra độ ẩm
  if (hum > HUMIDITY_THRESHOLD) {
    shouldAlarm = true;
    alarmReasons += "⚠️ ĐỘ ẨM CAO: " + String(hum, 1) + "% (>" + String(HUMIDITY_THRESHOLD, 0) + "%)\n";
  }
  
  // Kiểm tra AQI
  if (aqi > AQI_THRESHOLD) {
    shouldAlarm = true;
    alarmReasons += "⚠️ CHẤT LƯỢNG KHÔNG KHÍ XẤU: AQI " + String(aqi, 1) + " (>" + String(AQI_THRESHOLD, 0) + ")\n";
  }
  
  // Kiểm tra bụi
  if (dust_ug > DUST_THRESHOLD) {
    shouldAlarm = true;
    alarmReasons += "⚠️ BỤI MỊN CAO: " + String(dust_ug, 1) + " µg/m³ (>" + String(DUST_THRESHOLD, 0) + " µg/m³)\n";
  }
  
  // Kích hoạt còi nếu vượt ngưỡng
  if (shouldAlarm) {
    if (!isAlarmActive) {
      Serial.println("\n🚨🚨🚨 CẢNH BÁO! 🚨🚨🚨");
      Serial.println(alarmReasons);
      Serial.println("🔊 CÒI ĐANG KÊU...\n");
      isAlarmActive = true;
    }
    
    // Kêu còi 3 tiếng ngắn
    activateBuzzer(3, 200);
    
  } else {
    if (isAlarmActive) {
      Serial.println("✅ Các thông số đã trở về bình thường. Tắt còi.\n");
      isAlarmActive = false;
    }
  }
}

// ===== OTA FUNCTIONS =====
void checkForOTAUpdate() {
  Serial.println("\n🔍 Checking for OTA updates...");
  
  HTTPClient http;
  String url = String(OTA_SERVER_URL) + "/api/firmware/latest?current=" + String(FIRMWARE_VERSION);
  
  http.begin(url);
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    Serial.println("✅ Latest firmware info received:");
    Serial.println(payload);
    
    // Parse JSON to check hasUpdate
    if (payload.indexOf("\"hasUpdate\":true") >= 0) {
      Serial.println("🆕 New firmware available!");
      
      // Extract version from JSON
      int versionStart = payload.indexOf("\"latestVersion\":\"") + 17;
      int versionEnd = payload.indexOf("\"", versionStart);
      String newVersion = payload.substring(versionStart, versionEnd);
      
      Serial.printf("📦 New version: %s\n", newVersion.c_str());
      performOTAUpdate(newVersion);
    } else {
      Serial.println("✅ Firmware is up to date");
    }
  } else {
    Serial.printf("❌ HTTP error: %d\n", httpCode);
  }
  
  http.end();
}

void performOTAUpdate(String version) {
  Serial.printf("\n🚀 Starting OTA Update to version %s...\n", version.c_str());
  
  // 🆕 Kêu còi 5 tiếng để báo bắt đầu OTA
  activateBuzzer(5, 100);
  
  HTTPClient http;
  String url = String(OTA_SERVER_URL) + "/api/firmware/download/" + version;
  
  http.begin(url);
  
  // ✅ Collect headers TRƯỚC KHI GET
  const char* headerKeys[] = {"X-MD5", "Content-Length"};
  http.collectHeaders(headerKeys, 2);
  
  int httpCode = http.GET();
  
  if (httpCode != 200) {
    Serial.printf("❌ Download failed: HTTP %d\n", httpCode);
    http.end();
    return;
  }
  
  int contentLength = http.getSize();
  String md5Header = http.header("X-MD5");
  
  Serial.printf("📦 Firmware size: %d bytes\n", contentLength);
  Serial.printf("🔐 Expected MD5: %s\n", md5Header.c_str());
  Serial.printf("🔍 Debug - Header exists: %s\n", http.hasHeader("X-MD5") ? "YES" : "NO");
  
  if (contentLength <= 0) {
    Serial.println("❌ Invalid content length");
    http.end();
    return;
  }
  
  if (!Update.begin(contentLength)) {
    Serial.println("❌ Not enough space for OTA");
    http.end();
    return;
  }
  
  WiFiClient* stream = http.getStreamPtr();
  MD5Builder md5;
  md5.begin();
  
  size_t written = 0;
  uint8_t buff[128];
  
  while (http.connected() && written < contentLength) {
    size_t availableSize = stream->available();
    if (availableSize) {
      int bytesRead = stream->readBytes(buff, min(availableSize, sizeof(buff)));
      written += Update.write(buff, bytesRead);
      md5.add(buff, bytesRead);
      
      int progress = (written * 100) / contentLength;
      Serial.printf("\r⏳ Progress: %d%% (%d/%d bytes)", progress, written, contentLength);
      
      // 🆕 Beep ngắn mỗi 25% (Active HIGH)
      if (progress % 25 == 0 && progress > 0) {
        digitalWrite(BUZZER_PIN, HIGH);  // Bật (Active HIGH)
        delay(50);
        digitalWrite(BUZZER_PIN, LOW);   // Tắt (Active HIGH)
      }
    }
    delay(1);
  }
  Serial.println();
  
  md5.calculate();
  String calculatedMD5 = md5.toString();
  
  if (calculatedMD5 != md5Header) {
    Serial.println("❌ MD5 verification failed!");
    Serial.printf("Expected: %s\n", md5Header.c_str());
    Serial.printf("Calculated: %s\n", calculatedMD5.c_str());
    Update.abort();
    http.end();
    return;
  }
  
  Serial.println("✅ MD5 verification passed!");
  
  if (Update.end(true)) {
    Serial.println("✅ OTA Update successful!");
    Serial.println("🔄 Rebooting in 3 seconds...");
    
    // 🆕 Kêu còi 3 tiếng dài để báo thành công
    activateBuzzer(3, 500);
    
    delay(3000);
    ESP.restart();
  } else {
    Serial.println("❌ OTA Update failed!");
    Serial.println(Update.errorString());
  }
  
  http.end();
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n========================================");
  Serial.println("🟢 BTL IoT System - FIRMWARE v1.1.0");
  Serial.println("🆕 NEW FEATURES: Buzzer Alarm System (ACTIVE HIGH - FIXED)");
  Serial.println("========================================");
  
  dht.begin();

  pinMode(MQ135_DO, INPUT);
  pinMode(DUST_LED_PIN, OUTPUT);
  digitalWrite(DUST_LED_PIN, HIGH);  // tắt LED IR (active LOW)
  
  // 🆕 Khởi tạo chân còi (ACTIVE HIGH BUZZER - ĐÃ FIX!)
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);  // Tắt còi ban đầu (Active HIGH: LOW = OFF) ✅
  
  Serial.println("🔇 Buzzer initialized: OFF (Active HIGH mode)");
  
  // 🆕 Kêu còi 2 tiếng ngắn để báo khởi động thành công
  delay(500);
  activateBuzzer(2, 200);

  espClient.setCACert(hiveMQ_CA_cert);

  setup_wifi();

  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Đang đồng bộ thời gian NTP...");
  
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Lỗi lấy thời gian từ NTP!");
  } else {
    Serial.println("Đã đồng bộ thời gian thành công!");
  }

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);

  Serial.println("\n📊 System Information:");
  Serial.printf("Device ID: %s\n", DEVICE_ID);
  Serial.printf("Firmware Version: %s ⭐ UPGRADED!\n", FIRMWARE_VERSION);
  Serial.printf("OTA Server: %s\n", OTA_SERVER_URL);
  Serial.printf("🆕 Buzzer Pin: D14 (GPIO %d) - ACTIVE HIGH ✅\n", BUZZER_PIN);
  
  Serial.println("\n⚠️ NGƯỠNG CẢNH BÁO:");
  Serial.printf("  • Nhiệt độ: > %.0f°C\n", TEMP_THRESHOLD);
  Serial.printf("  • Độ ẩm: > %.0f%%\n", HUMIDITY_THRESHOLD);
  Serial.printf("  • AQI: > %.0f\n", AQI_THRESHOLD);
  Serial.printf("  • Bụi: > %.0f µg/m³\n", DUST_THRESHOLD);

  delay(2000);
  Serial.println("=== KHỞI ĐỘNG: DHT11 + MQ135 + GP2Y1010AU0F + BUZZER ===");
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  // Kiểm tra OTA update định kỳ
  if (millis() - lastOTACheck > OTA_CHECK_INTERVAL) {
    checkForOTAUpdate();
    lastOTACheck = millis();
  }

  // --- Đọc DHT11 ---
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Lỗi đọc cảm biến DHT11!");
    delay(2000);
    return;
  }

  // --- Đọc MQ135 ---
  int mq135_adc = analogRead(MQ135_AO);
  int mq135_digital = digitalRead(MQ135_DO);

  float Vcc = 3.3;                         
  float Vout = mq135_adc * (Vcc / 4095.0);
  float Vout_norm = Vout * (5.0 / Vcc);

  float AQI_gas = Vout_norm / 5.0 * 500;

  // --- Trung bình di động ---
  mq135_buffer[mq135_index] = AQI_gas;
  mq135_index++;
  if (mq135_index >= MQ135_SAMPLES) {
    mq135_index = 0;
    mq135_full = true;
  }

  float AQI_avg = 0;
  int count = mq135_full ? MQ135_SAMPLES : mq135_index;
  for (int i = 0; i < count; i++) AQI_avg += mq135_buffer[i];
  AQI_avg /= count;

  String air_quality;
  if (AQI_avg <= 50) air_quality = "1/4.Rất sạch";
  else if (AQI_avg <= 100) air_quality = "2/4.Bình thường";
  else if (AQI_avg <= 150) air_quality = "3/4.Ô nhiễm nhẹ";
  else if (AQI_avg <= 200) air_quality = "4/4.Ô nhiễm";
  else air_quality = "Ô nhiễm nặng";

  // --- Đọc bụi GP2Y1010AU0F ---
  digitalWrite(DUST_LED_PIN, LOW);
  delayMicroseconds(280);
  int dust_value = analogRead(DUST_AO_PIN);
  delayMicroseconds(40);
  digitalWrite(DUST_LED_PIN, HIGH);
  delayMicroseconds(9680);

  float dust_voltage = dust_value * (3.3 / 4095.0);
  float dust_density = (dust_voltage - 0.1) * 0.17;
  if (dust_density < 0) dust_density = 0;
  
  float dust_ug_m3 = dust_density * 1000;  // Chuyển sang µg/m³

  // 🆕 KIỂM TRA NGƯỠNG VÀ KÍCH HOẠT CÒI
  checkThresholdsAndAlarm(temperature, humidity, AQI_avg, dust_ug_m3);

  // --- Gửi dữ liệu lên MQTT ---
  String payload = "{";
  payload += "\"deviceId\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"datetime\":\"" + getDateTime() + "\","; 
  payload += "\"temperature\":" + String(temperature,1) + ",";
  payload += "\"humidity\":" + String(humidity,1) + ",";
  payload += "\"AQI\":" + String((int)AQI_avg) + ",";  // ✅ ĐỔI TỪ airQuality → AQI
  payload += "\"dust\":" + String(dust_ug_m3,1);
  payload += "}";

  client.publish("home/room1/sensors", payload.c_str());
  Serial.println("📤 Data sent: " + payload);

  String dust_level;
  if (dust_density < 0.05) dust_level = "1/4.Không khí sạch";
  else if (dust_density < 0.1) dust_level = "2/4.Bình thường";
  else if (dust_density < 0.2) dust_level = "3/4.Bụi nhẹ";
  else if (dust_density < 0.3) dust_level = "4/4.Ô nhiễm bụi";
  else dust_level = "5.Rất ô nhiễm (PM cao)";

  // --- IN KẾT QUẢ ---
  Serial.println("===========================================");
  Serial.print("Nhiệt độ: "); Serial.print(temperature); Serial.print(" °C");
  if (temperature > TEMP_THRESHOLD) Serial.print(" ⚠️ VƯỢT NGƯỠNG!");
  Serial.println();
  
  Serial.print("Độ ẩm: "); Serial.print(humidity); Serial.print(" %");
  if (humidity > HUMIDITY_THRESHOLD) Serial.print(" ⚠️ VƯỢT NGƯỠNG!");
  Serial.println();
  
  Serial.print("Ouput ADC cảm biến không khí MQ135 (AO): "); Serial.print(mq135_adc); 
  Serial.print(" | DO: "); Serial.println(mq135_digital);
  Serial.print("AQI (trung bình): "); Serial.print(AQI_avg,1); Serial.print(" | ");
  Serial.print(air_quality);
  if (AQI_avg > AQI_THRESHOLD) Serial.print(" ⚠️ VƯỢT NGƯỠNG!");
  Serial.println();
  
  Serial.print("Giá trị ADC bụi: "); Serial.println(dust_value);
  Serial.print("Điện áp bụi: "); Serial.print(dust_voltage, 3); Serial.println(" V");
  Serial.print("Nồng độ bụi: "); Serial.print(dust_ug_m3, 1); Serial.print(" µg/m³");
  if (dust_ug_m3 > DUST_THRESHOLD) Serial.print(" ⚠️ VƯỢT NGƯỠNG!");
  Serial.println();
  
  Serial.print("Đánh giá bụi: "); Serial.println(dust_level);
  Serial.println("===========================================\n");

  delay(2000);
}
