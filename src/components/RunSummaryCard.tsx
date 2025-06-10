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
  // Get styling based on summary type
  const getTypeConfig = (type: SummaryType) => {
    const configs = {
      daily: {
        accentColor: "bg-green-500 hover:bg-green-600",
        badgeColor: "bg-green-100 text-green-800",
        chartColor: "rgb(34, 197, 94)",
        chartBg: "rgba(34, 197, 94, 0.2)",
      },
      weekly: {
        accentColor: "bg-blue-500 hover:bg-blue-600",
        badgeColor: "bg-blue-100 text-blue-800",
        chartColor: "rgb(59, 130, 246)",
        chartBg: "rgba(59, 130, 246, 0.2)",
      },
      monthly: {
        accentColor: "bg-purple-500 hover:bg-purple-600",
        badgeColor: "bg-purple-100 text-purple-800",
        chartColor: "rgb(147, 51, 234)",
        chartBg: "rgba(147, 51, 234, 0.2)",
      },
      yearly: {
        accentColor: "bg-yellow-500 hover:bg-yellow-600",
        badgeColor: "bg-yellow-100 text-yellow-800",
        chartColor: "rgb(234, 179, 8)",
        chartBg: "rgba(234, 179, 8, 0.2)",
      },
    };
    return configs[type];
  };

  const typeConfig = getTypeConfig(type);

  // Update chart data with type-specific colors
  const updatedChartData = {
    ...chartData,
    datasets: chartData.datasets.map((dataset) => ({
      ...dataset,
      borderColor: typeConfig.chartColor,
      backgroundColor: typeConfig.chartBg,
    })),
  };

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

  // Fixed uniform height for all cards
  const cardHeight = "h-[420px]";

  return (
    <Card
      className={`w-full bg-white shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl flex flex-col ${cardHeight}`}
      style={{
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
      onMouseEnter={(e) => {
        if (type === "weekly") {
          e.currentTarget.style.boxShadow =
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 12px rgba(59, 130, 246, 0.5)";
        } else if (type === "monthly") {
          e.currentTarget.style.boxShadow =
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 12px rgba(168, 85, 247, 0.5)";
        } else if (type === "yearly") {
          e.currentTarget.style.boxShadow =
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 12px rgba(234, 179, 8, 0.5)";
        } else {
          e.currentTarget.style.boxShadow =
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
      }}
    >
      <CardHeader className="pb-3 p-6 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <Badge
            className={`${typeConfig.badgeColor} transition-all duration-200 cursor-default hover:font-semibold hover:bg-current`}
            style={{
              boxShadow: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)";
              e.currentTarget.style.transform = "scale(1.02)";
              // Preserve the original background color
              const bgColor = typeConfig.badgeColor.includes("green")
                ? "rgb(220, 252, 231)"
                : typeConfig.badgeColor.includes("blue")
                  ? "rgb(219, 234, 254)"
                  : typeConfig.badgeColor.includes("purple")
                    ? "rgb(243, 232, 255)"
                    : "rgb(254, 249, 195)";
              e.currentTarget.style.backgroundColor = bgColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.backgroundColor = "";
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </div>
        <CardTitle className="text-lg font-bold text-gray-800">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-4 flex-1 overflow-hidden">
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="h-32 w-full mb-4">
          <Line options={chartOptions} data={updatedChartData} />
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
                      className={`${typeConfig.accentColor.replace("bg-", "text-").replace("hover:bg-", "").replace("-500", "-500").replace("-600", "")} flex-shrink-0`}
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
