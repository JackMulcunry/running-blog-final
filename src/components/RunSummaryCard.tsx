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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, ChevronDown, Check } from "lucide-react";
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
  id = "sample-run-1",
  title = "June 9 - Daily Summary",
  description = "Completed a 5K morning run with steady pace throughout. Weather was perfect with light breeze.",
  type = "daily",
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
  includedDates = [],
  onNavigateToAnalytics = () => {},
}: RunSummaryCardProps) => {
  // Analyze pace trend from chart data
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

    // Format pace as MM:SS
    const formatPace = (pace: number) => {
      const minutes = Math.floor(pace);
      const seconds = Math.round((pace - minutes) * 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    let trend, caption, color;

    // Use ±1 second (0.017 minutes) as threshold for "same" pace
    if (Math.abs(paceDifference) <= 0.017) {
      // Same pace (within 1 second)
      trend = "even";
      caption = "Paced evenly";
      color = "#6b7280"; // Gray
    } else if (paceDifference < 0) {
      // Faster finish (negative difference means faster pace)
      trend = "faster";
      caption = "Strong finish";
      color = "#22c55e"; // Green
    } else {
      // Slower finish (positive difference means slower pace)
      trend = "slower";
      caption = "Started fast";
      color = "#ef4444"; // Red
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
  // Get styling based on summary type
  const getTypeConfig = (type: SummaryType) => {
    const configs = {
      daily: {
        accentColor: "bg-orange-500 hover:bg-orange-600",
        badgeColor: "bg-orange-50 text-orange-700",
        chartColor: "rgb(107, 114, 128)",
        chartBg: "rgba(107, 114, 128, 0.1)",
      },
      weekly: {
        accentColor: "bg-teal-500 hover:bg-teal-600",
        badgeColor: "bg-teal-50 text-teal-700",
        chartColor: "rgb(107, 114, 128)",
        chartBg: "rgba(107, 114, 128, 0.1)",
      },
      monthly: {
        accentColor: "bg-indigo-500 hover:bg-indigo-600",
        badgeColor: "bg-indigo-50 text-indigo-700",
        chartColor: "rgb(107, 114, 128)",
        chartBg: "rgba(107, 114, 128, 0.1)",
      },
      yearly: {
        accentColor: "bg-red-600 hover:bg-red-700",
        badgeColor: "bg-red-50 text-red-700",
        chartColor: "rgb(107, 114, 128)",
        chartBg: "rgba(107, 114, 128, 0.1)",
      },
    };
    return configs[type];
  };

  const typeConfig = getTypeConfig(type);

  // Update chart data with trend-based colors
  const updatedChartData = {
    ...chartData,
    datasets: chartData.datasets.map((dataset) => ({
      ...dataset,
      borderColor: paceAnalysis.color,
      backgroundColor: `${paceAnalysis.color}20`, // 20% opacity
      borderWidth: 2,
      fill: false,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 2,
        right: 2,
        bottom: 2,
        left: 2,
      },
    },
    animation: {
      duration: 1500,
      easing: "easeOutQuart",
      y: {
        from: (ctx: any) => {
          if (ctx.type === "data" && ctx.mode === "default") {
            const chart = ctx.chart;
            const { ctx: canvasCtx, chartArea } = chart;
            if (!chartArea) return;
            return chartArea.bottom;
          }
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false, // Disable tooltips for sparkline effect
      },
    },
    scales: {
      y: {
        display: false, // Completely hide y-axis
        beginAtZero: false,
        grid: {
          display: false, // Remove gridlines
        },
      },
      x: {
        display: false, // Completely hide x-axis
        grid: {
          display: false, // Remove gridlines
        },
      },
    },
    elements: {
      line: {
        tension: 0.2, // Flattened curve as requested
      },
      point: {
        radius: 0,
        hoverRadius: 0,
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  // Fixed uniform height for all cards
  const cardHeight = "h-[420px]";

  return (
    <Card
      className={`w-full bg-white shadow-sm rounded-xl transition-all duration-300 hover:shadow-md flex flex-col ${cardHeight}`}
      style={{
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
      }}
    >
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
          <div className="h-14 w-full bg-gray-50 rounded-lg border border-gray-100 mb-2 overflow-hidden">
            <Line options={chartOptions} data={updatedChartData} />
          </div>
          <div className="flex items-center justify-center">
            {paceAnalysis.startPace && paceAnalysis.endPace && (
              <span className="text-xs text-gray-600 font-mono text-center">
                Start: {paceAnalysis.startPace} • End: {paceAnalysis.endPace}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable section for non-daily summaries */}
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
