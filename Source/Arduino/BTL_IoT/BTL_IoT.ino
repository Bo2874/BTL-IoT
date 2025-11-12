#include <DHT.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include "time.h"


#define DHTPIN 15
#define DHTTYPE DHT11

#define MQ135_AO 32  // Ngõ ra analog MQ135 (AO)
#define MQ135_DO 33  // Ngõ ra digital MQ135 (DO)
#define DUST_LED_PIN 4   // LED control GP2Y1010AU0F (chân 3)
#define DUST_AO_PIN 35    // Vo cảm biến GP2Y1010AU0F (chân 5)

const char* ssid = "TP-Link_4142"; // Wifi-Name
const char* password = "88202143"; // password

const char* mqtt_server = "af8a20f5fbe04acda2f157995f4db76c.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "esp32-air-system";
const char* mqtt_pass = "Airsystem12345";


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
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
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

void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(MQ135_DO, INPUT);
  pinMode(DUST_LED_PIN, OUTPUT);
  digitalWrite(DUST_LED_PIN, HIGH);  // tắt LED IR (active LOW)

  espClient.setCACert(hiveMQ_CA_cert);  // TLS xác thực an toàn

  setup_wifi();

  // Cấu hình NTP để đồng bộ thời gian
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Đang đồng bộ thời gian NTP...");
  
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Lỗi lấy thời gian từ NTP!");
  } else {
    Serial.println("Đã đồng bộ thời gian thành công!");
  }

  client.setServer(mqtt_server, mqtt_port);

  delay(2000);
  Serial.println("=== KHỞI ĐỘNG: DHT11 + MQ135 + GP2Y1010AU0F ===");
}

void loop() {

  if (!client.connected()) reconnect();
  client.loop();

  // --- Đọc DHT11 ---
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  // --- Kiểm tra lỗi DHT ---
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Lỗi đọc cảm biến DHT11!");
    delay(2000);
    return;
  }

  // --- Đọc MQ135 ---
  int mq135_adc = analogRead(MQ135_AO);   // ADC 12-bit 0-4095
  int mq135_digital = digitalRead(MQ135_DO);

  float Vcc = 3.3;                         
  float Vout = mq135_adc * (Vcc / 4095.0); // điện áp đo được
  float Vout_norm = Vout * (5.0 / Vcc);    // chuẩn hóa về 5V theo datasheet

  float AQI_gas = Vout_norm / 5.0 * 500;   // mapping sang AQI tạm thời

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

  // --- Đánh giá chất lượng không khí dựa trên AQI_avg ---
  String air_quality;
  if (AQI_avg <= 50) air_quality = "1/4.Rất sạch";
  else if (AQI_avg <= 100) air_quality = "2/4.Bình thường";
  else if (AQI_avg <= 150) air_quality = "3/4.Ô nhiễm nhẹ";
  else if (AQI_avg <= 200) air_quality = "4/4.Ô nhiễm";
  else air_quality = "Ô nhiễm nặng";

  // --- Đọc cảm biến bụi GP2Y1010AU0F ---
  digitalWrite(DUST_LED_PIN, LOW);    // bật LED IR
  delayMicroseconds(280);
  int dust_value = analogRead(DUST_AO_PIN);
  delayMicroseconds(40);
  digitalWrite(DUST_LED_PIN, HIGH);   // tắt LED IR
  delayMicroseconds(9680);

  float dust_voltage = dust_value * (3.3 / 4095.0);  // ADC 12-bit
  float dust_density = (dust_voltage - 0.1) * 0.17;  // Công thức xấp xỉ mg/m³ (3.3V)
  if (dust_density < 0) dust_density = 0;

   // --- Gửi dữ liệu lên HiveMQ ---
  String payload = "{";
  payload += "\"datetime\":\"" + getDateTime() + "\","; 
  payload += "\"temperature\":" + String(temperature,1) + ",";
  payload += "\"humidity\":" + String(humidity,1) + ",";
  payload += "\"AQI\":" + String(AQI_avg,1) + ",";
  payload += "\"dust\":" + String(dust_density*1000,1);
  payload += "}";


  client.publish("home/room1/sensors", payload.c_str());
  Serial.println("Data sent: " + payload);

  // --- Đánh giá bụi mịn (PM) ---
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
  Serial.print("Chất lượng không khí (MQ135): "); Serial.println(air_quality);
  Serial.print("Giá trị ADC bụi: "); Serial.println(dust_value);
  Serial.print("Điện áp bụi: "); Serial.print(dust_voltage, 3); Serial.println(" V");
  Serial.print("Nồng độ bụi (xấp xỉ): "); Serial.print(dust_density * 1000, 1); Serial.println(" µg/m³");
  Serial.print("Đánh giá bụi: "); Serial.println(dust_level);
  Serial.println("===========================================\n");

  delay(2000);

}