import getAqiColor from "../utils/aqiColor";

export default function AQIBadge({ aqi }) {
  const color = getAqiColor(aqi);

  return (
    <span
      className="px-3 py-1 rounded-full text-white font-semibold"
      style={{ background: color }}
    >
      AQI: {aqi}
    </span>
  );
}
