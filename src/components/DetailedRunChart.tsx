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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DetailedRunChartProps {
  title: string;
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
}

const formatToMMSS = (value: number): string => {
  const min = Math.floor(value);
  const sec = Math.round((value - min) * 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

const DetailedRunChart = ({ title, data, dualAxis = false, paceFormat = false }: DetailedRunChartProps) => {
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

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full h-[320px] sm:h-[360px] md:h-[400px]">
      <Line data={data} options={chartOptions} />
    </div>
  );
};

export default DetailedRunChart;


