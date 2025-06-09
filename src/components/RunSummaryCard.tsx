import React from "react";
import { Line } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface RunSummaryCardProps {
  id: string;
  title: string;
  description: string;
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
  onNavigateToAnalytics: (runId: string) => void;
}

const RunSummaryCard = ({
  id = "sample-run-1",
  title = "June 9 - Daily Summary",
  description = "Completed a 5K morning run with steady pace throughout. Weather was perfect with light breeze.",
  chartData = {
    labels: ["0km", "1km", "2km", "3km", "4km", "5km"],
    datasets: [
      {
        label: "Pace (min/km)",
        data: [5.2, 5.0, 5.1, 4.9, 5.0, 4.8],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
      },
    ],
  },
  onNavigateToAnalytics = () => {},
}: RunSummaryCardProps) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
      x: {
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
      },
    },
  };

  return (
    <Card className="w-full bg-white overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-gray-800">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="h-32 w-full">
          <Line options={chartOptions} data={chartData} />
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          variant="default"
          className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2"
          onClick={() => onNavigateToAnalytics(id)}
        >
          View Analytics
          <ArrowRight size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RunSummaryCard;
