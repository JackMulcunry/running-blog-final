import React, { useState } from "react";
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
import { ArrowRight, Check } from "lucide-react";
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
  chartData: any;
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
  const paceChart = chartData?.pace_per_km;

  const analyzePaceTrend = () => {
    if (!paceChart || !paceChart.datasets || paceChart.datasets.length < 1 || paceChart.datasets[0].data.length < 2) {
      return {
        trend: "even",
        caption: "Paced evenly",
        color: "#6b7280",
        startPace: null,
        endPace: null,
      };
    }

    const paceData = paceChart.datasets[0].data;
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

  const getTypeConfig = (type: SummaryType) => {
    const configs = {
      daily: {
        accentColor: "bg-orange-500 hover:bg-orange-600",
        badgeColor: "bg-orange-50 text-orange-700",
      },
      weekly: {
        accentColor: "bg-teal-500 hover:bg-teal-600",
        badgeColor: "bg-teal-50 text-teal-700",
      },
      monthly: {
        accentColor: "bg-indigo-500 hover:bg-indigo-600",
        badgeColor: "bg-indigo-50 text-indigo-700",
      },
      yearly: {
        accentColor: "bg-red-600 hover:bg-red-700",
        badgeColor: "bg-red-50 text-red-700",
      },
    };
    return configs[type];
  };

  const typeConfig = getTypeConfig(type);

  const updatedChartData = {
    ...paceChart,
    datasets: paceChart?.datasets?.map((dataset: any) => ({
      ...dataset,
      borderColor: paceAnalysis.color,
      backgroundColor: `${paceAnalysis.color}20`,
      borderWidth: 2,
      fill: true,
      tension: 0.2,
    })) || [],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0,
    },
    animation: {
      duration: 800,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      y: {
        display: false,
        grid: {
          display: false,
        },
      },
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  return (
    <Card className="w-full bg-white shadow-sm rounded-xl transition-all flex flex-col h-[420px]">
      <CardHeader className="pb-3 p-6 bg-white">
        <div className="flex items-center justify-between mb-3">
          <Badge className={`${typeConfig.badgeColor} font-medium px-3 py-1 rounded-full text-sm hover:bg-transparent`}>
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
          <div className="h-16 w-full bg-gray-50 rounded-lg border border-gray-100 mb-2 overflow-hidden">
            <Line options={chartOptions} data={updatedChartData} />
          </div>
          <div className="text-center text-xs font-mono text-gray-500">
            Start: {paceAnalysis.startPace} • End: {paceAnalysis.endPace}
          </div>
        </div>

        {type !== "daily" && includedDates && includedDates.length > 0 && (
          <div className="mt-4 flex-1 overflow-hidden">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Included Runs ({includedDates.length})
            </div>
            <div className="max-h-[180px] overflow-y-auto bg-gray-50 rounded-md border border-gray-200 p-3 shadow-inner">
              <div className="space-y-2">
                {includedDates.map((date, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <Check
                      size={14}
                      className={`${typeConfig.accentColor.replace("bg-", "text-").replace(" hover:bg-", "").split(" ")[0]} flex-shrink-0`}
                    />
                    <span>{date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-4 mt-auto">
        <Button
          variant="default"
          className={`w-full ${typeConfig.accentColor} text-white flex items-center justify-center gap-2`}
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
