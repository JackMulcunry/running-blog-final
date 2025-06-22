import React from "react";
import { Chart } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

interface DetailedRunChartProps {
  title?: string;
  data: ChartData<"bar" | "line">;
  isHighlighted?: boolean;
  isWeekly?: boolean;
}

const DetailedRunChart: React.FC<DetailedRunChartProps> = ({
  title,
  data,
  isHighlighted = false,
  isWeekly = false,
}) => {
  const chartType = isWeekly ? "line" : "bar";

  const chartOptions: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
    },
    plugins: {
      legend: { display: true },
      title: { display: false },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(156, 163, 175, 0.3)",
          lineWidth: 1,
        },
        ticks: {
          callback: function (value, index, ticks) {
            const label = this.getLabelForValue(value as number);
            if (typeof label === "string" && label.includes("2025-")) {
              const date = new Date(label);
              return `${date.getMonth() + 1}-${date.getDate()}`;
            }
            return label;
          },
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        grid: {
          color: "rgba(156, 163, 175, 0.3)",
          lineWidth: 1,
        },
      },
    },
    elements: {
      line: {
        borderColor: "#14b8a6",
        backgroundColor: "rgba(20, 184, 166, 0.1)",
        borderWidth: 2,
        tension: 0.1,
      },
      point: {
        backgroundColor: "#14b8a6",
        borderColor: "#14b8a6",
        borderWidth: 2,
        radius: 4,
        hoverRadius: 6,
      },
      bar: {
        backgroundColor: "rgba(20, 184, 166, 0.8)",
        borderColor: "#14b8a6",
        borderWidth: 1,
      },
    },
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 h-full min-h-[400px] flex flex-col ${
        isHighlighted
          ? "ring-4 ring-red-400 ring-opacity-80 border-2 border-red-300"
          : "border border-gray-200"
      }`}
      style={{
        boxShadow: isHighlighted
          ? "0 8px 25px -5px rgba(239, 68, 68, 0.3), 0 8px 10px -6px rgba(239, 68, 68, 0.2), 0 0 0 4px rgba(239, 68, 68, 0.15)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      <h3 className="text-md font-semibold text-gray-700 mb-3 flex-shrink-0">
        {title}
      </h3>
      <div
        className={`flex-1 min-h-[320px] rounded-md overflow-hidden ${
          isHighlighted
            ? "border-2 border-red-200 bg-gradient-to-br from-red-50/50 to-red-25/30"
            : "border border-gray-100 bg-gradient-to-br from-gray-50/30 to-transparent"
        }`}
      >
        <Chart type={chartType} data={data} options={chartOptions} />
      </div>
    </div>
  );
};

export default DetailedRunChart;
