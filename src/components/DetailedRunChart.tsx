import React from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  title: string;
  type: "line" | "bar";
  data: any;
  height?: number;
  width?: number;
  paceFormat?: boolean;
  dualAxis?: boolean;
}

const formatToMMSS = (value: number): string => {
  const min = Math.floor(value);
  const sec = Math.round((value - min) * 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

const DynamicChart = ({
  title,
  type,
  data,
  height = 400,
  width = 1000,
  paceFormat = false,
  dualAxis = false,
}: ChartProps) => {
  const chartOptions: ChartOptions<"line" | "bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: title,
        font: { size: 16, weight: "bold" as const },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.parsed.y;
            if (paceFormat) return `${context.dataset.label}: ${formatToMMSS(val)} /km`;
            return `${context.dataset.label}: ${val}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: paceFormat
          ? {
              callback: (value: any) =>
                typeof value === "number" ? formatToMMSS(value) : value,
            }
          : {},
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      ...(dualAxis && {
        y1: {
          position: "right" as const,
          grid: { drawOnChartArea: false },
        },
      }),
      x: {
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full" style={{ height, maxWidth: width }}>
      {type === "line" ? (
        <Line data={data} options={chartOptions as ChartOptions<"line">} />
      ) : (
        <Bar data={data} options={chartOptions as ChartOptions<"bar">} />
      )}
    </div>
  );
};

export default DynamicChart;
