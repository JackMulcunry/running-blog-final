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
  onNavigateToAnalytics: (runId: string, highlightedChart?: string) => void;
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

  // Weekly card placeholder graph sections
  const weeklyGraphSections = [
    {
      title: "Heart Rate Trends",
      subtitle: "Average and max heart rate for each day (Mon–Sat)",
    },
    { title: "Distance Over the Week", subtitle: "Distance (km) per day" },
    { title: "Climb Rate Analysis", subtitle: "Climb per km for each day" },
    {
      title: "Efficiency Score",
      subtitle: "Daily efficiency score progression",
    },
    { title: "Cadence Comparison", subtitle: "Avg cadence vs. max speed" },
    { title: "Pace Consistency", subtitle: "Pace per km per day" },
  ];

  // For weekly summaries, select a random chart to display and highlight
  const getRandomWeeklyChart = () => {
    if (type !== "weekly" || !chartData) return null;

    const availableCharts = [];
    if (chartData.distance_per_day)
      availableCharts.push({
        key: "distance_per_day",
        data: chartData.distance_per_day,
        label: "Distance per Day",
      });
    if (chartData.heart_rate_trend)
      availableCharts.push({
        key: "heart_rate_trend",
        data: chartData.heart_rate_trend,
        label: "Heart Rate Trends",
      });
    if (chartData.efficiency_score_trend)
      availableCharts.push({
        key: "efficiency_score_trend",
        data: chartData.efficiency_score_trend,
        label: "Efficiency Score",
      });
    if (chartData.climb_rate)
      availableCharts.push({
        key: "climb_rate",
        data: chartData.climb_rate,
        label: "Climb Rate",
      });
    if (chartData.cadence_speed)
      availableCharts.push({
        key: "cadence_speed",
        data: chartData.cadence_speed,
        label: "Cadence vs Speed",
      });
    if (chartData.pace_consistency)
      availableCharts.push({
        key: "pace_consistency",
        data: chartData.pace_consistency,
        label: "Pace Consistency",
      });

    if (availableCharts.length === 0) return null;

    // Use the run ID as seed for consistent random selection
    const seed = id.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    const randomIndex = seed % availableCharts.length;

    return availableCharts[randomIndex];
  };

  const randomWeeklyChart = getRandomWeeklyChart();

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
    // For weekly summaries, use the random chart
    if (type === "weekly" && randomWeeklyChart) {
      return {
        type: randomWeeklyChart.key,
        data: randomWeeklyChart.data,
        label: randomWeeklyChart.label,
        color: "#0d9488", // teal
        bgColor: "#0d948820",
      };
    }

    // For daily summaries, use the existing logic
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
      borderColor: "#f97316",
      glowColor: "#f9731620",
      cardBg: "bg-white",
      titleColor: "text-gray-900",
    },
    weekly: {
      accentColor: "bg-teal-600 hover:bg-teal-700",
      badgeColor: "bg-teal-100 text-teal-800 font-bold border border-teal-200",
      borderColor: "#0d9488",
      glowColor: "#0d948830",
      cardBg: "bg-gradient-to-br from-teal-50 to-cyan-50",
      titleColor: "text-teal-900",
    },
    monthly: {
      accentColor: "bg-indigo-500 hover:bg-indigo-600",
      badgeColor: "bg-indigo-50 text-indigo-700",
      borderColor: "#6366f1",
      glowColor: "#6366f120",
      cardBg: "bg-white",
      titleColor: "text-gray-900",
    },
    yearly: {
      accentColor: "bg-red-600 hover:bg-red-700",
      badgeColor: "bg-red-50 text-red-700",
      borderColor: "#dc2626",
      glowColor: "#dc262620",
      cardBg: "bg-white",
      titleColor: "text-gray-900",
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
    const isWeeklyChart = type === "weekly";

    return {
      labels: data.labels || [],
      datasets:
        data.datasets?.map((ds: any) => ({
          ...ds,
          borderColor: color,
          backgroundColor:
            selectedChart.type === "efficiency" || isWeeklyChart
              ? bgColor
              : Array.isArray(ds.backgroundColor)
                ? ds.backgroundColor
                : color,
          fill:
            selectedChart.type === "efficiency" || isWeeklyChart
              ? true
              : ds.fill,
          tension:
            selectedChart.type === "efficiency" || isWeeklyChart
              ? 0.4
              : ds.tension,
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

    const ChartComponent =
      selectedChart.type === "efficiency" || type === "weekly" ? Line : Bar;
    const chartOptions = getChartOptions(selectedChart.type);

    return <ChartComponent data={miniChartData} options={chartOptions} />;
  };

  // Render regular daily/monthly/yearly cards
  return (
    <Card
      className={`w-full ${typeConfig.cardBg} rounded-xl flex flex-col h-[450px] ${
        selectedChart ? "shadow-lg" : "shadow"
      } hover:shadow-xl transition-all duration-300 ${
        type === "weekly" ? "ring-2 ring-teal-200 border-teal-100" : ""
      }`}
      style={{
        boxShadow: selectedChart
          ? `0 10px 25px -3px ${selectedChart.color}20, 0 4px 6px -2px ${selectedChart.color}10, 0 0 0 2px ${selectedChart.color}20`
          : type === "weekly"
            ? `0 8px 25px -5px ${typeConfig.glowColor}, 0 8px 10px -6px ${typeConfig.glowColor}`
            : `0 4px 6px -1px ${typeConfig.glowColor}, 0 2px 4px -1px ${typeConfig.glowColor}`,
      }}
    >
      <CardHeader className="pb-3 p-6">
        <div className="flex justify-between items-center mb-3">
          <Badge
            className={`${typeConfig.badgeColor} px-3 py-1 text-sm rounded-full hover:bg-transparent hover:text-inherit`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
          {selectedChart && (
            <Badge
              className="px-2 py-1 text-xs rounded-full font-medium hover:bg-transparent hover:text-inherit"
              style={{
                backgroundColor: selectedChart.bgColor,
                color: selectedChart.color,
                border: `1px solid ${selectedChart.color}30`,
              }}
            >
              {selectedChart.type
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl font-bold ${typeConfig.titleColor}">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-4 flex-1 overflow-hidden">
        <div className="mb-4">
          <p className="text-sm leading-relaxed text-gray-600">{description}</p>
        </div>
        <div className="mb-4">
          <div
            className="relative w-full overflow-hidden rounded-lg h-[120px]"
            style={{
              backgroundColor: selectedChart?.bgColor || "#f9fafb",
              border: selectedChart
                ? `2px solid ${selectedChart.color}30`
                : "1px solid #e5e7eb",
            }}
          >
            {renderChart()}
          </div>
          <div className="text-center text-xs mt-2 text-gray-600 font-mono">
            {selectedChart?.label ||
              `Start: ${paceAnalysis.startSpeed} • End: ${paceAnalysis.endSpeed}`}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-4 mt-auto">
        <Button
          className={`w-full ${typeConfig.accentColor} text-white hover:shadow-lg transition-all duration-200`}
          onClick={() => onNavigateToAnalytics(id, randomWeeklyChart?.key)}
        >
          View Analytics
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RunSummaryCard;
