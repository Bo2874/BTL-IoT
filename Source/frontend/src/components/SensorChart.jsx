import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function SensorChart({ data, label, borderColor = "rgb(59, 130, 246)", backgroundColor = "rgba(59, 130, 246, 0.1)" }) {
  const chartData = {
    labels: data.map(i => i.time),
    datasets: [
      {
        label: label,
        data: data.map(i => i.value),
        fill: true,
        borderColor: borderColor,
        backgroundColor: backgroundColor,
        borderWidth: 3,
        tension: 0.4, // Làm mượt đường line
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: borderColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    // Allow the chart to fill the parent container height to prevent overlap
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        borderColor: borderColor,
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10
          }
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="w-full h-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
