import { React } from "react";
import { Line } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

type SummaryType = "daily" | "weekly" | "monthly" | "yearly";

interface RunSummaryCardProps {
  id: string;
  title: string;
  description: string;
  type?: SummaryType;
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension?: number;
    }[];
  };
  includedDates?: string[];
  onNavigateToAnalytics: (runId: string) => void;
}

const RunSummaryCard = ({
  id,
  title,
  description,
  type = "daily",
  chartData,
  includedDates = [],
  onNavigateToAnalytics,
}: RunSummaryCardProps) => {
  const analyzePaceTrend = () => {
    if (!chartData.datasets[0] || chartData.datasets[0].data.length < 2) {
      return {
        trend: "even",
        caption: "Paced evenly",
        color: "#6b7280",
        startPace: null,
        endPace: null,
      };
    }

    const paceData = chartData.datasets[0].data;
    const startPace = paceData[0];
    const endPace = paceData[paceData.length - 1];
    const paceDifference = endPace - startPace;

    const formatPace = (pace: number) => {
      const minutes = Math.floor(pace);
      const seconds = Math.round((pace - minutes) * 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    let trend, caption, color;

    if (Math.abs(paceDifference) <= 0.017) {
      trend = "even";
      caption = "Paced evenly";
      color = "#6b7280";
    } else if (paceDifference < 0) {
      trend = "faster";
      caption = "Strong finish";
      color = "#22c55e";
    } else {
      trend = "slower";
      caption = "Started fast";
      color = "#ef4444";
    }

    return {
      trend,
      caption,
      color,
      startPace: formatPace(startPace),
      endPace: formatPace(endPace),
      paceDifference,
    };
  };

  const paceAnalysis = analyzePaceTrend();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: 0,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false, grid: { display: false } },
      y: { display: false, grid: { display: false } },
    },
    animation: false,
  };

  return (
    <Card className="w-full bg-white shadow-sm rounded-xl transition-all flex flex-col h-[420px]">
      <CardHeader className="pb-3 p-6 bg-white">
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-orange-50 text-orange-700 font-medium px-3 py-1 rounded-full text-sm">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-4 flex-1 overflow-hidden">
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {description}
        </p>
        <div className="mb-4">
          <div className="h-20 w-full bg-gray-50 rounded-lg border border-gray-100 mb-2 overflow-hidden">
            <Line
              options={chartOptions}
              data={{
                labels: chartData.labels,
                datasets: chartData.datasets.map((d) => ({
                  ...d,
                  borderColor: paceAnalysis.color,
                  backgroundColor: `${paceAnalysis.color}20`,
                  borderWidth: 2,
                  fill: true,
                  tension: 0.2,
                })),
              }}
            />
          </div>
          <div className="text-center text-xs font-mono text-gray-500">
            Start: {paceAnalysis.startPace || "-"} • End: {paceAnalysis.endPace || "-"}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-4 mt-auto">
        <Button
          variant="default"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2"
          onClick={() => onNavigateToAnalytics(id)}
        >
          View Analytics
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
            />
          </svg>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RunSummaryCard;
