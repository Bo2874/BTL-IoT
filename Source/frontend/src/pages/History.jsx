import { useEffect, useState } from "react";
import { getHistory } from "../api/sensors";
import SensorChart from "../components/SensorChart";
import Loader from "../components/Loader";

export default function History() {
  const [history, setHistory] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getHistory(50);
    setHistory(res);
  };

  if (!history) return <Loader />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Lịch sử đo</h1>

      <SensorChart
        label="PM2.5"
        data={history.map(i => ({
          time: new Date(i.time).toLocaleTimeString(),
          value: i.pm25
        }))}
      />
    </div>
  );
}
