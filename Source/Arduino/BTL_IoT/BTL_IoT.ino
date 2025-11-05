#include <DHT.h>

#define DHTPIN 15
#define DHTTYPE DHT11

#define MQ135_AO 32  // Ngõ ra analog MQ135 (AO)
#define MQ135_DO 33  // Ngõ ra digital MQ135 (DO)
#define DUST_LED_PIN 4   // LED control GP2Y1010AU0F (chân 3)
#define DUST_AO_PIN 35    // Vo cảm biến GP2Y1010AU0F (chân 5)

DHT dht(DHTPIN, DHTTYPE);

// --- Cấu hình trung bình di động MQ135 ---
#define MQ135_SAMPLES 5
float mq135_buffer[MQ135_SAMPLES] = {0};
int mq135_index = 0;
bool mq135_full = false;

void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(MQ135_DO, INPUT);
  pinMode(DUST_LED_PIN, OUTPUT);
  digitalWrite(DUST_LED_PIN, HIGH);  // tắt LED IR (active LOW)

  delay(2000);
  Serial.println("=== KHỞI ĐỘNG: DHT11 + MQ135 + GP2Y1010AU0F ===");
}

void loop() {
  // --- Đọc DHT11 ---
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  // --- Kiểm tra lỗi DHT ---
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("❌ Lỗi đọc cảm biến DHT11!");
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
  if (AQI_avg <= 50) air_quality = "🔵 Rất sạch";
  else if (AQI_avg <= 100) air_quality = "🟢 Bình thường";
  else if (AQI_avg <= 150) air_quality = "🟡 Ô nhiễm nhẹ";
  else if (AQI_avg <= 200) air_quality = "🟠 Ô nhiễm";
  else air_quality = "🔴 Ô nhiễm nặng";

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

  // --- Đánh giá bụi mịn (PM) ---
  String dust_level;
  if (dust_density < 0.05) dust_level = "🔵 Không khí sạch";
  else if (dust_density < 0.1) dust_level = "🟢 Bình thường";
  else if (dust_density < 0.2) dust_level = "🟡 Bụi nhẹ";
  else if (dust_density < 0.3) dust_level = "🟠 Ô nhiễm bụi";
  else dust_level = "🔴 Rất ô nhiễm (PM cao)";

  // --- IN KẾT QUẢ ---
  Serial.println("===========================================");
  Serial.print("🌡 Nhiệt độ: "); Serial.print(temperature); Serial.println(" °C");
  Serial.print("💧 Độ ẩm: "); Serial.print(humidity); Serial.println(" %");
  Serial.print("💨 MQ135 (AO): "); Serial.print(mq135_adc); 
  Serial.print(" | DO: "); Serial.println(mq135_digital);
  Serial.print("📊 Chất lượng không khí (MQ135): "); Serial.println(air_quality);
  Serial.print("🌫 Giá trị ADC bụi: "); Serial.println(dust_value);
  Serial.print("⚡ Điện áp bụi: "); Serial.print(dust_voltage, 3); Serial.println(" V");
  Serial.print("🌁 Nồng độ bụi (xấp xỉ): "); Serial.print(dust_density * 1000, 1); Serial.println(" µg/m³");
  Serial.print("💠 Đánh giá bụi: "); Serial.println(dust_level);
  Serial.println("===========================================\n");

  delay(2000);
}
