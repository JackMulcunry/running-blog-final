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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface DetailedRunChartProps {
  title: string;
  type?: "line" | "bar";
  data: {
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
  dualAxis?: boolean;
  paceFormat?: boolean;
  height?: number;
}

const formatToMMSS = (value: number): string => {
  const min = Math.floor(value);
  const sec = Math.round((value - min) * 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

const DetailedRunChart = ({
  title,
  type = "line",
  data,
  dualAxis = false,
  paceFormat = false,
  height = 400,
}: DetailedRunChartProps) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: title,
        font: { size: 16, weight: "bold" as const },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.parsed.y;
            if (paceFormat)
              return `${context.dataset.label}: ${formatToMMSS(val)} /km`;
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
    elements: {
      point: {
        radius: 4,
        borderWidth: 2,
        hoverRadius: 6,
      },
      line: {
        tension: 0.3,
      },
    },
  };

  const ChartComponent = type === "bar" ? Bar : Line;

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <ChartComponent data={data} options={chartOptions} />
    </div>
  );
};

export default DetailedRunChart;
