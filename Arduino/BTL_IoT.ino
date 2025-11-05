#include <DHT.h>

#define DHTPIN 15
#define DHTTYPE DHT11

#define MQ135_AO 32  // Ngõ ra analog MQ135 (AO)
#define MQ135_DO 33  // Ngõ ra digital MQ135 (DO)
#define DUST_LED_PIN 4   // LED control GP2Y1010AU0F (chân 3)
#define DUST_AO_PIN 2    // Vo cảm biến GP2Y1010AU0F (chân 5)

DHT dht(DHTPIN, DHTTYPE);

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

  // --- Đọc MQ135 ---
  int mq135_value = analogRead(MQ135_AO);
  int mq135_digital = digitalRead(MQ135_DO);

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

  // --- Kiểm tra lỗi DHT ---
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("❌ Lỗi đọc cảm biến DHT11!");
    delay(2000);
    return;
  }

  // --- Đánh giá MQ135 ---
  String air_quality;
  if (mq135_value > 3000) air_quality = "🔵 Rất sạch";
  else if (mq135_value > 2000) air_quality = "🟢 Bình thường";
  else if (mq135_value > 1000) air_quality = "🟡 Ô nhiễm nhẹ";
  else if (mq135_value > 500) air_quality = "🟠 Ô nhiễm";
  else air_quality = "🔴 Ô nhiễm nặng";

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
  Serial.print("💨 MQ135 (AO): "); Serial.print(mq135_value); Serial.print(" | DO: "); Serial.println(mq135_digital);
  Serial.print("📊 Chất lượng không khí: "); Serial.println(air_quality);
  Serial.print("🌫 Giá trị ADC bụi: "); Serial.println(dust_value);
  Serial.print("⚡ Điện áp bụi: "); Serial.print(dust_voltage, 3); Serial.println(" V");
  Serial.print("🌁 Nồng độ bụi (xấp xỉ): "); Serial.print(dust_density * 1000, 1); Serial.println(" µg/m³");
  Serial.print("💠 Đánh giá bụi: "); Serial.println(dust_level);
  Serial.println("===========================================\n");

  delay(2000);
}
