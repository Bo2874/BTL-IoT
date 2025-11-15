export default function getAqiColor(aqi) {
  if (aqi <= 50) return "#4CAF50";      // Tốt
  if (aqi <= 100) return "#FFEB3B";     // Trung bình
  if (aqi <= 150) return "#FF9800";     // Kém
  if (aqi <= 200) return "#F44336";     // Xấu
  return "#880E4F";                     // Nguy hại
}
