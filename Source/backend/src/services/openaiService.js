import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

/**
 * Tạo prompt cho OpenAI từ dữ liệu thống kê
 */
function buildPrompt(stats, sampleCount) {
  return `Bạn là chuyên gia an toàn lao động và môi trường nhà máy, chuyên phân tích chất lượng không khí trong khu vực sản xuất công nghiệp.

📋 BÁO CÁO GIÁM SÁT CHẤT LƯỢNG KHÔNG KHÍ NHÀ MÁY
⏰ Khoảng thời gian: 1 giờ vừa qua
📊 Số lần đo: ${sampleCount} mẫu

📈 DỮ LIỆU ĐO ĐẠC:

🌡️ Nhiệt độ môi trường làm việc:
- Thấp nhất: ${stats.temperature.min.toFixed(1)}°C
- Cao nhất: ${stats.temperature.max.toFixed(1)}°C
- Trung bình: ${stats.temperature.avg.toFixed(1)}°C

💧 Độ ẩm không khí:
- Thấp nhất: ${stats.humidity.min.toFixed(1)}%
- Cao nhất: ${stats.humidity.max.toFixed(1)}%
- Trung bình: ${stats.humidity.avg.toFixed(1)}%

🌫️ Chỉ số AQI (Air Quality Index):
- Thấp nhất: ${stats.aqi.min}
- Cao nhất: ${stats.aqi.max}
- Trung bình: ${Math.round(stats.aqi.avg)}

💨 Nồng độ bụi mịn PM2.5:
- Thấp nhất: ${stats.pm25.min.toFixed(1)} µg/m³
- Cao nhất: ${stats.pm25.max.toFixed(1)} µg/m³
- Trung bình: ${stats.pm25.avg.toFixed(1)} µg/m³

📊 TIÊU CHUẨN THAM KHẢO:
- AQI: Tốt (0-50) | Trung bình (51-100) | Kém (101-150) | Xấu (151-200) | Nguy hiểm (>200)
- PM2.5: Tốt (<12) | Trung bình (12-35.4) | Kém (35.5-55.4) | Xấu (55.5-150.4) | Nguy hiểm (>150.5) µg/m³
- Nhiệt độ: Lý tưởng (20-28°C) | Chấp nhận được (18-32°C)
- Độ ẩm: Lý tưởng (40-60%) | Chấp nhận được (30-70%)

📋 YÊU CẦU PHÂN TÍCH (Format theo template):

**🔍 NHẬN XÉT TỔNG QUAN:**
[Mô tả ngắn gọn tình trạng môi trường trong 2-3 câu]

**📊 ĐÁNH GIÁ CHI TIẾT:**
- Nhiệt độ: [Đánh giá có phù hợp không, có dao động bất thường không]
- Độ ẩm: [Đánh giá mức độ ẩm, ảnh hưởng gì]
- AQI: [So với tiêu chuẩn, có vượt ngưỡng an toàn không]
- PM2.5: [So với tiêu chuẩn, có ảnh hưởng sức khỏe không]

**⚠️ XU HƯỚNG & DẤU HIỆU:**
[Phân tích dao động trong giờ qua: ổn định, tăng, giảm, bất thường]

**💡 KHUYẾN NGHỊ:**
- Cho ban quản lý: [Hành động cụ thể nếu cần]
- Cho công nhân/nhân viên: [Biện pháp bảo vệ nếu cần]
- Biện pháp cải thiện: [Nếu có vấn đề]

**✅ KẾT LUẬN:**
Mức độ an toàn: [AN TOÀN ✅ / CẦN LƯU Ý ⚠️ / NGUY HIỂM ⛔]

Viết bằng tiếng Việt, giọng văn chuyên nghiệp, dựa vào số liệu thực tế để đánh giá chính xác.`;
}

/**
 * Gọi OpenAI API để tạo summary
 */
export async function generateAISummary(stats, sampleCount) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY không được cấu hình trong .env");
  }

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Bạn là chuyên gia an toàn lao động và môi trường công nghiệp, có nhiều năm kinh nghiệm phân tích và giám sát chất lượng không khí trong các khu vực sản xuất nhà máy.",
          },
          {
            role: "user",
            content: buildPrompt(stats, sampleCount),
          },
        ],
        temperature: 0.7
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        timeout: 30000, // 30s timeout
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("❌ OpenAI API Error:", error.response?.data || error.message);
    
    // Fallback: tạo summary cơ bản nếu API lỗi
    return generateFallbackSummary(stats, sampleCount);
  }
}

/**
 * Tạo summary dự phòng khi OpenAI API không khả dụng
 */
function generateFallbackSummary(stats, sampleCount) {
  // Đánh giá AQI (theo tiêu chuẩn EPA)
  const aqiLevel = 
    stats.aqi.avg <= 50 ? { text: "Tốt", icon: "✅", color: "xanh" } :
    stats.aqi.avg <= 100 ? { text: "Trung bình", icon: "🟢", color: "vàng nhạt" } :
    stats.aqi.avg <= 150 ? { text: "Kém", icon: "⚠️", color: "cam" } :
    stats.aqi.avg <= 200 ? { text: "Xấu", icon: "🔴", color: "đỏ" } :
    { text: "Rất xấu", icon: "⛔", color: "tím" };

  // Đánh giá PM2.5 (theo tiêu chuẩn WHO & EPA)
  const pm25Level =
    stats.pm25.avg < 12 ? { text: "Tốt", safe: true } :
    stats.pm25.avg < 35.5 ? { text: "Trung bình", safe: true } :
    stats.pm25.avg < 55.5 ? { text: "Kém", safe: false } :
    stats.pm25.avg < 150.5 ? { text: "Xấu", safe: false } :
    { text: "Nguy hiểm", safe: false };

  // Đánh giá nhiệt độ (môi trường trong nhà)
  const tempLevel = 
    stats.temperature.avg < 18 ? { text: "Lạnh", comfort: false, desc: "có thể ảnh hưởng năng suất" } :
    stats.temperature.avg < 20 ? { text: "Mát", comfort: true, desc: "hơi mát nhưng chấp nhận được" } :
    stats.temperature.avg <= 26 ? { text: "Lý tưởng", comfort: true, desc: "rất thoải mái cho làm việc" } :
    stats.temperature.avg <= 28 ? { text: "Thoải mái", comfort: true, desc: "phù hợp làm việc" } :
    stats.temperature.avg <= 30 ? { text: "Hơi ấm", comfort: true, desc: "cần thông gió tốt" } :
    stats.temperature.avg <= 32 ? { text: "Ấm", comfort: false, desc: "cần điều hòa" } :
    { text: "Nóng", comfort: false, desc: "cần điều hòa gấp" };

  // Đánh giá độ ẩm (môi trường trong nhà)
  const humidityLevel =
    stats.humidity.avg < 30 ? { text: "Khô", comfort: false, desc: "có thể gây khó chịu" } :
    stats.humidity.avg < 40 ? { text: "Hơi khô", comfort: true, desc: "chấp nhận được" } :
    stats.humidity.avg <= 60 ? { text: "Lý tưởng", comfort: true, desc: "rất thoải mái" } :
    stats.humidity.avg <= 70 ? { text: "Hơi ẩm", comfort: true, desc: "chấp nhận được" } :
    { text: "Ẩm", comfort: false, desc: "có thể gây khó chịu" };

  // Đánh giá tổng thể an toàn
  const overallSafety = 
    (stats.aqi.avg <= 100 && pm25Level.safe && tempLevel.comfort && humidityLevel.comfort) ? "✅ AN TOÀN" :
    (stats.aqi.avg <= 150 || !pm25Level.safe || !tempLevel.comfort || !humidityLevel.comfort) ? "⚠️ CẦN LƯU Ý" :
    "⛔ CẦN HÀNH ĐỘNG";

  return `📋 BÁO CÁO GIÁM SÁT CHẤT LƯỢNG KHÔNG KHÍ NHÀ MÁY
⏰ Thời gian: 1 giờ vừa qua | 📊 Số mẫu: ${sampleCount}

🔍 NHẬN XÉT TỔNG QUAN:
Môi trường làm việc trong giờ qua có nhiệt độ ${tempLevel.text.toLowerCase()} (${stats.temperature.avg.toFixed(1)}°C), độ ẩm ${humidityLevel.text.toLowerCase()} (${stats.humidity.avg.toFixed(1)}%). Chất lượng không khí đạt mức ${aqiLevel.text.toLowerCase()} với AQI ${Math.round(stats.aqi.avg)} và nồng độ bụi PM2.5 ở mức ${pm25Level.text.toLowerCase()} (${stats.pm25.avg.toFixed(1)} µg/m³).

📊 ĐÁNH GIÁ CHI TIẾT:

🌡️ Nhiệt độ: ${tempLevel.icon || aqiLevel.icon} ${tempLevel.text}
   • Trung bình: ${stats.temperature.avg.toFixed(1)}°C (dao động ${stats.temperature.min.toFixed(1)}-${stats.temperature.max.toFixed(1)}°C)
   • Đánh giá: ${tempLevel.desc}

💧 Độ ẩm: ${humidityLevel.comfort ? '✅' : '⚠️'} ${humidityLevel.text}
   • Trung bình: ${stats.humidity.avg.toFixed(1)}% (dao động ${stats.humidity.min.toFixed(1)}-${stats.humidity.max.toFixed(1)}%)
   • Đánh giá: ${humidityLevel.desc}

🌫️ Chỉ số AQI: ${aqiLevel.icon} ${aqiLevel.text}
   • Trung bình: ${Math.round(stats.aqi.avg)} (dao động ${stats.aqi.min}-${stats.aqi.max})
   • Tiêu chuẩn: ${stats.aqi.avg <= 50 ? 'Đạt chuẩn tốt' : stats.aqi.avg <= 100 ? 'Trong giới hạn chấp nhận' : stats.aqi.avg <= 150 ? 'Vượt ngưỡng an toàn' : 'Vượt ngưỡng nguy hiểm'}

💨 Bụi mịn PM2.5: ${pm25Level.safe ? '✅' : '⚠️'} ${pm25Level.text}
   • Trung bình: ${stats.pm25.avg.toFixed(1)} µg/m³ (dao động ${stats.pm25.min.toFixed(1)}-${stats.pm25.max.toFixed(1)} µg/m³)
   • Tiêu chuẩn WHO: ${stats.pm25.avg < 12 ? 'Đạt' : stats.pm25.avg < 35.5 ? 'Chấp nhận được' : 'Vượt ngưỡng'}

⚠️ XU HƯỚNG & DẤU HIỆU:
${Math.abs(stats.temperature.max - stats.temperature.min) > 5 ? '• Nhiệt độ dao động khá lớn (' + (stats.temperature.max - stats.temperature.min).toFixed(1) + '°C), cần kiểm tra hệ thống điều hòa\n' : ''}${Math.abs(stats.aqi.max - stats.aqi.min) > 50 ? '• AQI biến động mạnh, có thể do hoạt động sản xuất không đều\n' : '• Các chỉ số khá ổn định trong giờ qua\n'}${stats.pm25.max > 55 ? '• Có thời điểm PM2.5 vượt ngưỡng an toàn (' + stats.pm25.max.toFixed(1) + ' µg/m³)\n' : ''}
💡 KHUYẾN NGHỊ:

${stats.aqi.avg > 150 || stats.pm25.avg > 55 ?
  `⛔ CHO BAN QUẢN LÝ:
   • NGAY LẬP TỨC kiểm tra và bảo trì hệ thống thông gió/lọc khí
   • Xác định nguồn phát sinh bụi và xử lý
   • Cân nhắc tạm dừng hoạt động sản xuất nếu chỉ số tiếp tục tăng
   
   ⚠️ CHO CÔNG NHÂN:
   • BẮT BUỘC đeo khẩu trang N95 hoặc tương đương
   • Hạn chế thời gian làm việc liên tục, nghỉ giải lao thường xuyên
   • Báo cáo ngay nếu có triệu chứng khó thở, ho` :
  stats.aqi.avg > 100 || stats.pm25.avg > 35 ?
  `⚠️ CHO BAN QUẢN LÝ:
   • Kiểm tra định kỳ hệ thống thông gió
   • Theo dõi sát các chỉ số trong giờ tới
   • Chuẩn bị phương án ứng phó nếu chất lượng không khí xấu đi
   
   💡 CHO CÔNG NHÂN:
   • Nên đeo khẩu trang y tế khi làm việc
   • Hạn chế hoạt động nặng nhọc
   • Uống đủ nước` :
  !tempLevel.comfort || !humidityLevel.comfort ?
  `✅ CHO BAN QUẢN LÝ:
   • Chất lượng không khí tốt, tiếp tục duy trì
   ${!tempLevel.comfort ? '   • Điều chỉnh nhiệt độ điều hòa về mức 24-26°C\n' : ''}${!humidityLevel.comfort ? '   • Điều chỉnh độ ẩm về mức 40-60%\n' : ''}   
   💡 CHO CÔNG NHÂN:
   • Môi trường làm việc an toàn
   ${!tempLevel.comfort && stats.temperature.avg > 30 ? '   • Bổ sung nước thường xuyên do nhiệt độ cao' : ''}` :
  `✅ CHO BAN QUẢN LÝ:
   • Môi trường làm việc ở trạng thái tốt
   • Duy trì chế độ bảo trì định kỳ
   • Tiếp tục giám sát để phát hiện sớm bất thường
   
   ✅ CHO CÔNG NHÂN:
   • Điều kiện làm việc an toàn và thoải mái
   • Không cần biện pháp bảo vệ đặc biệt`}

✅ KẾT LUẬN: ${overallSafety}
${overallSafety === "✅ AN TOÀN" ? 
  'Môi trường làm việc đạt tiêu chuẩn, an toàn cho sức khỏe người lao động.' :
  overallSafety === "⚠️ CẦN LƯU Ý" ?
  'Có một số chỉ số cần theo dõi, thực hiện các khuyến nghị trên.' :
  'Tình trạng nghiêm trọng, cần hành động khẩn cấp!'}`
}

