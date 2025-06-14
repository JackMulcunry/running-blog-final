import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
 PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface DetailedRunChartProps {
  title?: string;
  data?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill?: boolean;
      tension?: number;
    }[];
  };
  chartData?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill?: boolean;
      tension?: number;
      yAxisID?: string;
    }[];
  };
  height?: number;
  width?: number;
}

const DetailedRunChart = ({
  title = "Run Performance",
  data,
  chartData,
  height = 400,
  width = 1000,
}: DetailedRunChartProps) => {
  const defaultData = {
    labels: ["1km", "2km", "3km", "4km"],
    datasets: [
      {
        label: "Pace (min/km)",
        data: [5.7, 5.65, 5.67, 5.75],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartDataToUse = chartData || data || defaultData;

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            const value = context.parsed.y;
            const minutes = Math.floor(value);
            const seconds = Math.round((value - minutes) * 60);
            const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;
            return `${context.dataset.label}: ${formatted} /km`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: function (value) {
            if (typeof value === "number") {
              const minutes = Math.floor(value);
              const seconds = Math.round((value - minutes) * 60);
              return `${minutes}:${seconds.toString().padStart(2, "0")}`;
            }
            return value;
          },
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 w-full"
      style={{ height, maxWidth: width }}
    >
      <Line options={options} data={chartDataToUse} />
    </div>
  );
};

export default DetailedRunChart;
