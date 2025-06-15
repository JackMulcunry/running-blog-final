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
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
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
    // Extract pace data from chartData.pace_per_km
    const paceChartData = chartData?.pace_per_km;
    if (
      !paceChartData ||
      !paceChartData.datasets ||
      !paceChartData.datasets[0] ||
      paceChartData.datasets[0].data.length < 2
    ) {
      return {
        trend: "even",
        caption: "No pace data",
        color: "#6b7280",
        startPace: "--:--",
        endPace: "--:--",
      };
    }

    const paceData = paceChartData.datasets[0].data;
    const customTooltipLabels = paceChartData.datasets[0].customTooltipLabels;
    const startPace = paceData[0];
    const endPace = paceData[paceData.length - 1];
    const paceDifference = endPace - startPace;

    // Use custom tooltip labels if available, otherwise format the numeric pace
    const getFormattedPace = (index: number, paceValue: number) => {
      if (customTooltipLabels && customTooltipLabels[index]) {
        return customTooltipLabels[index];
      }
      const minutes = Math.floor(paceValue);
      const seconds = Math.round((paceValue - minutes) * 60);
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
      startPace: getFormattedPace(0, startPace),
      endPace: getFormattedPace(paceData.length - 1, endPace),
      paceDifference,
    };
  };

  const paceAnalysis = analyzePaceTrend();

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
    animation: {
      duration: 0,
    },
    layout: {
      padding: {
        top: 8,
        right: 8,
        bottom: 8,
        left: 8,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      y: {
        display: false,
        grid: { display: false },
        ticks: { display: false },
        border: { display: false },
      },
      x: {
        display: false,
        grid: { display: false },
        ticks: { display: false },
        border: { display: false },
      },
    },
    elements: {
      point: { radius: 0, hoverRadius: 0 },
      line: { tension: 0.4, borderWidth: 2 },
    },
    interaction: { intersect: false, mode: "index" },
  };

  // Extract pace data from chartData.pace_per_km for the mini chart
  const paceChartData = chartData?.pace_per_km;

  // Create some variation in the data for better visualization if all values are the same
  const createVariedData = (originalData: number[]) => {
    if (!originalData || originalData.length === 0) return [];

    if (originalData.every((val) => val === originalData[0])) {
      // Add slight variation to create a more interesting chart
      const baseValue = originalData[0];
      return originalData.map((_, index) => {
        const variation =
          Math.sin(index * 0.8) * 0.05 + (Math.random() * 0.02 - 0.01);
        return baseValue + variation;
      });
    }
    return originalData;
  };

  // Prepare chart data with fallback for empty data
  const miniChartData = {
    labels: paceChartData?.labels || [],
    datasets:
      paceChartData?.datasets?.length > 0
        ? paceChartData.datasets.map((ds) => ({
            ...ds,
            data: createVariedData(ds.data || []),
            borderColor: typeConfig.chartColor,
            backgroundColor: typeConfig.chartBg,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          }))
        : [
            {
              label: "No data",
              data: [],
              borderColor: typeConfig.chartColor,
              backgroundColor: typeConfig.chartBg,
              fill: true,
              tension: 0.4,
              borderWidth: 2,
            },
          ],
  };

  return (
    <Card className="w-full bg-white shadow-sm rounded-xl transition-all flex flex-col h-[420px]">
      <CardHeader className="pb-3 p-6 bg-white">
        <div className="flex items-center justify-between mb-3">
          <Badge
            className={`${typeConfig.badgeColor} font-medium px-3 py-1 rounded-full text-sm hover:bg-transparent`}
          >
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
          <div className="h-[120px] w-full bg-white rounded-lg mb-3 border border-gray-100 relative">
            {paceChartData?.datasets?.length > 0 &&
            paceChartData.datasets[0]?.data?.length > 0 ? (
              <div className="absolute inset-0 w-full h-full">
                <Line data={miniChartData} options={chartOptions} />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                No pace data available
              </div>
            )}
          </div>
          <div className="text-center text-xs font-mono text-gray-500 leading-tight">
            Start: {paceAnalysis.startPace} • End: {paceAnalysis.endPace}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-4 mt-auto">
        <Button
          variant="default"
          className={`w-full ${typeConfig.accentColor} text-white flex items-center justify-center gap-2`}
          onClick={() => onNavigateToAnalytics(id)}
        >
          View Analytics
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RunSummaryCard;
