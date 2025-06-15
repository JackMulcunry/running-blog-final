

import React from "react";
import { Chart } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";

interface DetailedRunChartProps {
  title?: string;
  data: ChartData<"bar" | "line">;
}

const DetailedRunChart: React.FC<DetailedRunChartProps> = ({ title, data }) => {
  const chartType = ["heart_rate", "efficiency_score"].includes(title?.toLowerCase() || "")
    ? "bar"
    : "line";

  const chartOptions: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: false },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 min-h-[300px]">
      <h3 className="text-md font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="h-[250px]">
        <Chart type={chartType} data={data} options={chartOptions} />
      </div>
    </div>
  );
};

export default DetailedRunChart;
