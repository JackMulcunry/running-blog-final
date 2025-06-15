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
}

const DetailedRunChart: React.FC<DetailedRunChartProps> = ({ title, data }) => {
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
    <div className="bg-white rounded-lg shadow-md p-4 min-h-[300px]">
      <h3 className="text-md font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="h-[250px]">
        <Chart type={chartType} data={data} options={chartOptions} />
      </div>
    </div>
  );
};

export default DetailedRunChart;
