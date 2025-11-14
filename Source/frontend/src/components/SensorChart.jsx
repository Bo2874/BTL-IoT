import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function SensorChart({ data, label }) {
  const chartData = {
    labels: data.map(i => i.time),
    datasets: [
      {
        label: label,
        data: data.map(i => i.value),
        fill: false,
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <Line data={chartData} />
    </div>
  );
}
