#include <DHT.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Update.h>
#include <MD5Builder.h>
#include "time.h"

// ===== FIRMWARE VERSION =====
const char* FIRMWARE_VERSION = "1.0.0";  // 🔴 PHIÊN BẢN 1.0.0

#define DHTPIN 15
#define DHTTYPE DHT11

#define MQ135_AO 32  // Ngõ ra analog MQ135 (AO)
#define MQ135_DO 33  // Ngõ ra digital MQ135 (DO)
#define DUST_LED_PIN 4   // LED control GP2Y1010AU0F (chân 3)
#define DUST_AO_PIN 35    // Vo cảm biến GP2Y1010AU0F (chân 5)

// 🔇 BUZZER PIN - CHỈ ĐỂ TẮT, KHÔNG ĐIỀU KHIỂN
#define BUZZER_PIN 14    // Chân còi D14 (GPIO 14) - LUÔN TẮT trong v1.0.0

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
      
      // Subscribe to OTA topic
      String otaTopic = "iot/devices/" + String(DEVICE_ID) + "/ota";
      client.subscribe(otaTopic.c_str());
      Serial.printf("📬 Subscribed to: %s\n", otaTopic.c_str());
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

// --- MQTT Callback cho OTA ---
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.printf("\n📨 Message from topic: %s\n", topic);
  
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println("Message: " + message);
  
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
  Serial.println("🔴 BTL IoT System - FIRMWARE v1.0.0");
  Serial.println("========================================");
  
  dht.begin();

  pinMode(MQ135_DO, INPUT);
  pinMode(DUST_LED_PIN, OUTPUT);
  digitalWrite(DUST_LED_PIN, HIGH);  // tắt LED IR (active LOW)
  
  // 🔇 TẮT CÒI CỨNG - KHÔNG ĐIỀU KHIỂN ĐƯỢC TRONG v1.0.0
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);  // TẮT còi (Active HIGH: LOW = OFF)
  Serial.println("🔇 Buzzer DISABLED in v1.0.0 (permanently OFF)");

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
  Serial.printf("Firmware Version: %s\n", FIRMWARE_VERSION);
  Serial.printf("OTA Server: %s\n", OTA_SERVER_URL);

  delay(2000);
  Serial.println("=== KHỞI ĐỘNG: DHT11 + MQ135 + GP2Y1010AU0F ===");
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

  // --- Gửi dữ liệu lên MQTT ---
  String payload = "{";
  payload += "\"deviceId\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"datetime\":\"" + getDateTime() + "\","; 
  payload += "\"temperature\":" + String(temperature,1) + ",";
  payload += "\"humidity\":" + String(humidity,1) + ",";
  payload += "\"AQI\":" + String((int)AQI_avg) + ",";  // ✅ ĐỔI TỪ airQuality → AQI
  payload += "\"dust\":" + String(dust_density*1000,1);
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
  Serial.print("Nhiệt độ: "); Serial.print(temperature); Serial.println(" °C");
  Serial.print("Độ ẩm: "); Serial.print(humidity); Serial.println(" %");
  Serial.print("Ouput ADC cảm biến không khí MQ135 (AO): "); Serial.print(mq135_adc); 
  Serial.print(" | DO: "); Serial.println(mq135_digital);
  Serial.print("AQI (trung bình): "); Serial.print(AQI_avg,1); Serial.print(" | ");
  Serial.println(air_quality);
  Serial.print("Giá trị ADC bụi: "); Serial.println(dust_value);
  Serial.print("Điện áp bụi: "); Serial.print(dust_voltage, 3); Serial.println(" V");
  Serial.print("Nồng độ bụi: "); Serial.print(dust_density * 1000, 1); Serial.println(" µg/m³");
  Serial.print("Đánh giá bụi: "); Serial.println(dust_level);
  Serial.println("===========================================\n");

  delay(2000);
}
