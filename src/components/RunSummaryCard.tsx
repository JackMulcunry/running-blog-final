import React from "react";
import { Bar, Line } from "react-chartjs-2";
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
  BarElement,
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
  BarElement,
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
    speed_cadence: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        backgroundColor: string | string[];
      }[];
    };
    heart_rate?: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
      }[];
    };
    efficiency_score?: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        fill: boolean;
        tension: number;
      }[];
    };
    elevation_summary?: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
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
    const trend =
      Math.abs(diff) <= 0.2 ? "even" : diff > 0 ? "faster" : "slower";

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

  const selectBestChart = () => {
    // Check elevation first (highest priority)
    if (chartData?.elevation_summary?.datasets?.[0]?.data) {
      const elevationData = chartData.elevation_summary.datasets[0].data;
      const maxElevation = Math.max(...elevationData);
      if (maxElevation > 150) {
        return {
          type: "elevation",
          data: chartData.elevation_summary,
          label: `Peak: ${maxElevation.toFixed(0)}m`,
          color: "#8b5cf6", // purple
          bgColor: "#8b5cf620",
        };
      }
    }

    // Check heart rate second
    if (chartData?.heart_rate?.datasets?.[0]?.data) {
      const hrData = chartData.heart_rate.datasets[0].data;
      const avgHr = hrData.reduce((a, b) => a + b, 0) / hrData.length;
      const maxHr = Math.max(...hrData);
      if (avgHr > 165 || maxHr > 180) {
        return {
          type: "heart_rate",
          data: chartData.heart_rate,
          label: `Avg: ${avgHr.toFixed(0)} • Max: ${maxHr.toFixed(0)} bpm`,
          color: "#ef4444", // red
          bgColor: "#ef444420",
        };
      }
    }

    // Check speed third
    if (chartData?.speed_cadence?.datasets?.[0]?.data) {
      const speedData = chartData.speed_cadence.datasets[0].data;
      const maxSpeed = Math.max(...speedData);
      if (maxSpeed > 18) {
        return {
          type: "speed",
          data: chartData.speed_cadence,
          label: `Max: ${maxSpeed.toFixed(1)} km/h`,
          color: "#22c55e", // green
          bgColor: "#22c55e20",
        };
      }
    }

    // Check efficiency last
    if (chartData?.efficiency_score?.datasets?.[0]?.data) {
      const efficiencyData = chartData.efficiency_score.datasets[0].data;
      const maxEfficiency = Math.max(...efficiencyData);
      if (maxEfficiency > 1.7) {
        return {
          type: "efficiency",
          data: chartData.efficiency_score,
          label: `Peak: ${maxEfficiency.toFixed(2)}`,
          color: "#f59e0b", // amber
          bgColor: "#f59e0b20",
        };
      }
    }

    // Fallback to speed chart if available
    if (chartData?.speed_cadence) {
      const paceAnalysis = analyzeSpeedTrend();
      return {
        type: "speed",
        data: chartData.speed_cadence,
        label: `${paceAnalysis.startSpeed} → ${paceAnalysis.endSpeed}`,
        color: paceAnalysis.color,
        bgColor: `${paceAnalysis.color}20`,
      };
    }

    return null;
  };

  const selectedChart = selectBestChart();
  const paceAnalysis = analyzeSpeedTrend();

  const typeConfig = {
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
  }[type];

  const getChartOptions = (chartType: string): ChartOptions<any> => {
    const baseOptions = {
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
    };

    if (chartType === "efficiency") {
      return {
        ...baseOptions,
        elements: {
          line: {
            borderWidth: 2,
            tension: 0.4,
          },
          point: {
            radius: 0,
          },
        },
      };
    }

    return {
      ...baseOptions,
      elements: {
        bar: {
          borderRadius: 2,
        },
      },
    };
  };

  const getMiniChartData = () => {
    if (!selectedChart) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const { data, color, bgColor } = selectedChart;

    return {
      labels: data.labels || [],
      datasets:
        data.datasets?.map((ds: any) => ({
          ...ds,
          borderColor: color,
          backgroundColor:
            selectedChart.type === "efficiency"
              ? bgColor
              : Array.isArray(ds.backgroundColor)
                ? ds.backgroundColor
                : color,
          fill: selectedChart.type === "efficiency" ? true : ds.fill,
          tension: selectedChart.type === "efficiency" ? 0.4 : ds.tension,
        })) || [],
    };
  };

  const miniChartData = getMiniChartData();

  const renderChart = () => {
    if (!selectedChart || miniChartData.datasets.length === 0) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
          No data available
        </div>
      );
    }

    const ChartComponent = selectedChart.type === "efficiency" ? Line : Bar;
    const chartOptions = getChartOptions(selectedChart.type);

    return <ChartComponent data={miniChartData} options={chartOptions} />;
  };

  return (
    <Card
      className={`w-full bg-white rounded-xl flex flex-col h-[420px] ${
        selectedChart ? "shadow-lg" : "shadow"
      }`}
      style={{
        boxShadow: selectedChart
          ? `0 10px 25px -3px ${selectedChart.color}20, 0 4px 6px -2px ${selectedChart.color}10, 0 0 0 2px ${selectedChart.color}20`
          : undefined,
      }}
    >
      <CardHeader className="pb-3 p-6">
        <div className="flex justify-between items-center mb-3">
          <Badge
            className={`${typeConfig.badgeColor} px-3 py-1 rounded-full text-sm`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
          {selectedChart && (
            <Badge
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: selectedChart.bgColor,
                color: selectedChart.color,
                border: `1px solid ${selectedChart.color}30`,
              }}
            >
              {selectedChart.type.charAt(0).toUpperCase() +
                selectedChart.type.slice(1).replace("_", " ")}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-4 flex-1 overflow-hidden">
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="mb-4">
          <div
            className="relative h-[120px] w-full overflow-hidden rounded-lg"
            style={{
              backgroundColor: selectedChart?.bgColor || "#f9fafb",
              border: selectedChart
                ? `2px solid ${selectedChart.color}30`
                : "1px solid #e5e7eb",
            }}
          >
            {renderChart()}
          </div>
          <div className="text-center text-xs text-gray-600 mt-2 font-mono">
            {selectedChart?.label ||
              `Start: ${paceAnalysis.startSpeed} • End: ${paceAnalysis.endSpeed}`}
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
