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
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

type SummaryType = "daily" | "weekly" | "monthly" | "yearly";

interface RunSummaryCardProps {
  id: string;
  title: string;
  description: string;
  type?: SummaryType;
  chartData: {
    pace_per_km: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        customTooltipLabels?: string[];
      }[];
    };
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
  const paceChartData = chartData?.speed_cadence;

const analyzeSpeedTrend = () => {
  if (
    !paceChartData ||
    !paceChartData.datasets ||
    !paceChartData.datasets[0] ||
    paceChartData.datasets[0].data.length < 2
  ) {
    return {
      trend: "even",
      caption: "No speed data",
      color: "#6b7280",
      startSpeed: "--",
      endSpeed: "--",
    };
  }

  const data = paceChartData.datasets[0].data;
  const start = data[0];
  const end = data[data.length - 1];

  const diff = end - start;
  const trend = Math.abs(diff) <= 0.2 ? "even" : diff > 0 ? "faster" : "slower";

  const caption =
    trend === "faster"
      ? "Accelerated"
      : trend === "slower"
      ? "Slowed down"
      : "Maintained speed";

  const color =
    trend === "faster"
      ? "#22c55e"
      : trend === "slower"
      ? "#ef4444"
      : "#6b7280";

  return {
    trend,
    caption,
    color,
    startSpeed: `${start.toFixed(2)} km/h`,
    endSpeed: `${end.toFixed(2)} km/h`,
  };
};

const paceAnalysis = analyzeSpeedTrend();

  const typeConfig = {
    daily: {
      accentColor: "bg-orange-500 hover:bg-orange-600",
      badgeColor: "bg-orange-50 text-orange-700",
      chartColor: paceAnalysis.color,
      chartBg: `${paceAnalysis.color}20`,
    },
    weekly: {
      accentColor: "bg-teal-500 hover:bg-teal-600",
      badgeColor: "bg-teal-50 text-teal-700",
      chartColor: paceAnalysis.color,
      chartBg: `${paceAnalysis.color}20`,
    },
    monthly: {
      accentColor: "bg-indigo-500 hover:bg-indigo-600",
      badgeColor: "bg-indigo-50 text-indigo-700",
      chartColor: paceAnalysis.color,
      chartBg: `${paceAnalysis.color}20`,
    },
    yearly: {
      accentColor: "bg-red-600 hover:bg-red-700",
      badgeColor: "bg-red-50 text-red-700",
      chartColor: paceAnalysis.color,
      chartBg: `${paceAnalysis.color}20`,
    },
  }[type];

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      y: { display: false },
      x: { display: false },
    },
    elements: {
      point: { radius: 0 },
      line: {
        borderWidth: 2,
        tension: 0.4,
      },
    },
  };

  const miniChartData = {
    labels: paceChartData?.labels || [],
    datasets:
      paceChartData?.datasets?.length > 0
        ? paceChartData.datasets.map((ds) => ({
            ...ds,
            borderColor: typeConfig.chartColor,
            backgroundColor: typeConfig.chartBg,
            fill: true,
          }))
        : [],
  };

  return (
    <Card className="w-full bg-white shadow rounded-xl flex flex-col h-[420px]">
      <CardHeader className="pb-3 p-6">
        <div className="flex justify-between items-center mb-3">
          <Badge
            className={`${typeConfig.badgeColor} px-3 py-1 rounded-full text-sm`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-4 flex-1 overflow-hidden">
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="mb-4">
          <div className="relative h-[120px] w-full overflow-hidden">
            {miniChartData.datasets.length > 0 ? (
              <Line data={miniChartData} options={chartOptions} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                No pace data available
              </div>
            )}
          </div>
          <div className="text-center text-xs text-gray-500 mt-2 font-mono">
              Start: {paceAnalysis.startSpeed} • End: {paceAnalysis.endSpeed}
        </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-4 mt-auto">
        <Button
          className={`w-full ${typeConfig.accentColor} text-white`}
          onClick={() => onNavigateToAnalytics(id)}
        >
          View Analytics
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RunSummaryCard;

