import getAqiColor from "../utils/aqiColor";

export default function AQIBadge({ aqi }) {
  const color = getAqiColor(aqi);
  
  const getAqiLevel = (aqi) => {
    if (aqi <= 50) return "Tốt";
    if (aqi <= 100) return "Trung bình";
    if (aqi <= 150) return "Kém";
    if (aqi <= 200) return "Xấu";
    return "Nguy hại";
  };

  return (
    <div className="inline-block">
      <div
        className="px-8 py-4 rounded-2xl text-white font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
        style={{ background: color }}
      >
        <div className="text-center">
          <p className="text-sm opacity-90 mb-1">Chỉ số chất lượng không khí</p>
          <p className="text-5xl font-extrabold mb-1">{aqi}</p>
          <p className="text-lg font-semibold">{getAqiLevel(aqi)}</p>
        </div>
      </div>
    </div>
  );
}
