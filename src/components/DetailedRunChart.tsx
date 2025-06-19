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
}

const DetailedRunChart: React.FC<DetailedRunChartProps> = ({
  title,
  data,
  isHighlighted = false,
}) => {
  const chartType = "bar";

  const chartOptions: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: false },
    },
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 min-h-[300px] ${
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
      <h3 className="text-md font-semibold text-gray-700 mb-2">{title}</h3>
      <div
        className={`h-[250px] rounded-md p-2 ${
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
