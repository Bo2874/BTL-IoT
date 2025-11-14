import { useEffect, useState } from "react";
import { getRealtime } from "../api/sensors";
import RealtimeCard from "../components/RealtimeCard";
import AQIBadge from "../components/AQIBadge";
import Loader from "../components/Loader";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    load();

    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const load = async () => {
    const res = await getRealtime();
    setData(res);
  };

  if (!data) return <Loader />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Realtime Air Quality</h1>

      <AQIBadge aqi={data.aqi} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RealtimeCard title="Nhiệt độ" value={data.temperature} unit="°C" icon="🌡️" />
        <RealtimeCard title="Độ ẩm" value={data.humidity} unit="%" icon="💧" />
        <RealtimeCard title="PM2.5" value={data.pm25} unit="µg/m³" icon="🌫️" />
      </div>
    </div>
  );
}
