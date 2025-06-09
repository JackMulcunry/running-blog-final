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
    labels: [
      "0km",
      "1km",
      "2km",
      "3km",
      "4km",
      "5km",
      "6km",
      "7km",
      "8km",
      "9km",
      "10km",
    ],
    datasets: [
      {
        label: "Pace (min/km)",
        data: [5.2, 5.1, 5.3, 5.0, 5.4, 5.2, 5.1, 5.0, 4.9, 4.8, 4.7],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Heart Rate (bpm)",
        data: [130, 145, 150, 155, 160, 165, 168, 170, 172, 175, 178],
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Elevation (m)",
        data: [10, 15, 20, 25, 30, 25, 20, 25, 30, 35, 30],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
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
        position: "top" as const,
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
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
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
