import React, { useEffect, useState } from "react";
import DetailedRunChart from "../../components/DetailedRunChart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Heart,
  TrendingUp,
  Mountain,
  Zap,
  Activity,
  Target,
  BarChart3,
} from "lucide-react";

interface RunData {
  id: string;
  title: string;
  date: string;
  description: string;
  detailedDescription: string;
  type: "daily" | "weekly" | "monthly" | "yearly";
  stats: {
    distance: number;
    duration: string;
    pace: string;
    elevation: number;
    heartRate: number;
    climbPerKm: number;
    effortScore: number;
    effortPerKm: number;
    elevationPercentPerKm: number;
    paceVariance: number;
    fatigueScore: number;
  };
  chartData: any;
  includedDates?: string[];
}

interface RunAnalyticsPageProps {
  runId: string;
  onNavigateHome: () => void;
}

export default function RunAnalyticsPage({
  runId,
  onNavigateHome,
}: RunAnalyticsPageProps) {
  const [runData, setRunData] = useState<RunData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRunData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.BASE_URL}data/runs/${runId}.json`,
        ); // Change to your actual endpoint if needed
        if (!res.ok) throw new Error("Failed to fetch run data");
        const data = await res.json();
        setRunData(data);
      } catch (error) {
        console.error("Error fetching run data:", error);
        setRunData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRunData();
  }, [runId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading run data...</p>
        </div>
      </div>
    );
  }

  if (!runData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-500 mb-2">
                Run Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                The run data you're looking for could not be found.
              </p>
              <Button onClick={onNavigateHome}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const theme = {
    daily: {
      bgClass: "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100",
      accentColor: "text-amber-700",
      iconColor: "text-amber-600",
      cardBg: "bg-white/80 backdrop-blur-sm border-amber-200/50",
    },
    weekly: {
      bgClass: "bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100",
      accentColor: "text-blue-700",
      iconColor: "text-blue-600",
      cardBg: "bg-white/80 backdrop-blur-sm border-blue-200/50",
    },
    monthly: {
      bgClass: "bg-gradient-to-br from-purple-50 via-slate-50 to-purple-100",
      accentColor: "text-purple-700",
      iconColor: "text-purple-600",
      cardBg: "bg-white/80 backdrop-blur-sm border-purple-200/50",
    },
    yearly: {
      bgClass: "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100",
      accentColor: "text-orange-700",
      iconColor: "text-orange-600",
      cardBg: "bg-white/80 backdrop-blur-sm border-orange-200/50",
    },
  }[runData.type];

  // Mock data for demonstration - in real app this would come from the API
  const mockChartData = {
    pacePerKm: {
      labels: ["1km", "2km", "3km", "4km", "5km"],
      datasets: [
        {
          label: "Pace",
          data: [4.5, 4.3, 4.6, 4.4, 4.2],
          borderColor: theme.iconColor.includes("amber")
            ? "#f59e0b"
            : "#3b82f6",
          backgroundColor: theme.iconColor.includes("amber")
            ? "#fef3c7"
            : "#dbeafe",
          tension: 0.4,
        },
      ],
    },
    effortVsFatigue: {
      labels: ["1km", "2km", "3km", "4km", "5km"],
      datasets: [
        {
          label: "Effort per km",
          data: [7.5, 8.2, 8.8, 8.5, 9.1],
          borderColor: "#f59e0b",
          yAxisID: "y",
        },
        {
          label: "Fatigue Score",
          data: [3.2, 4.1, 5.5, 6.2, 7.8],
          borderColor: "#ef4444",
          yAxisID: "y1",
        },
      ],
    },
    climbRate: {
      labels: ["1km", "2km", "3km", "4km", "5km"],
      datasets: [
        {
          label: "Climb Rate (m/km)",
          data: [12, 18, 25, 15, 8],
          borderColor: "#10b981",
          backgroundColor: "#d1fae5",
          tension: 0.4,
        },
      ],
    },
    paceVariance: {
      labels: ["1km", "2km", "3km", "4km", "5km"],
      datasets: [
        {
          label: "Pace Variance",
          data: [0.2, 0.15, 0.3, 0.18, 0.12],
          backgroundColor: theme.iconColor.includes("amber")
            ? "#fbbf24"
            : "#60a5fa",
        },
      ],
    },
    caloriesPerKm: {
      labels: ["1km", "2km", "3km", "4km", "5km"],
      datasets: [
        {
          label: "Calories per km",
          data: [85, 88, 92, 87, 90],
          backgroundColor: "#f97316",
        },
      ],
    },
  };

  return (
    <div className={`min-h-screen ${theme.bgClass} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={onNavigateHome}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Runs
          </Button>
        </div>

        {/* Header Card */}
        <Card className={`mb-8 ${theme.cardBg} shadow-lg`}>
          <CardHeader>
            <CardTitle className={`text-3xl font-bold ${theme.accentColor}`}>
              {runData.title}
            </CardTitle>
            <CardDescription className="text-gray-600 flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5" /> {runData.date}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                {runData.description}
              </p>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {runData.detailedDescription}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 📊 Performance Summary - Essential Metrics */}
        <Card className={`mb-8 ${theme.cardBg} shadow-lg`}>
          <CardHeader>
            <CardTitle
              className={`text-2xl font-bold ${theme.accentColor} flex items-center`}
            >
              <BarChart3 className={`mr-3 h-6 w-6 ${theme.iconColor}`} />
              📊 Performance Summary
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Essential metrics from your run
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white/60 p-4 rounded-lg border border-gray-200/50 text-center">
                <MapPin className={`h-8 w-8 ${theme.iconColor} mx-auto mb-2`} />
                <p className="text-sm text-gray-600 font-medium">Distance</p>
                <p className="text-xl font-bold text-gray-800">
                  {runData.stats.distance} km
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg border border-gray-200/50 text-center">
                <Clock className={`h-8 w-8 ${theme.iconColor} mx-auto mb-2`} />
                <p className="text-sm text-gray-600 font-medium">Duration</p>
                <p className="text-xl font-bold text-gray-800">
                  {runData.stats.duration}
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg border border-gray-200/50 text-center">
                <TrendingUp
                  className={`h-8 w-8 ${theme.iconColor} mx-auto mb-2`}
                />
                <p className="text-sm text-gray-600 font-medium">Pace</p>
                <p className="text-xl font-bold text-gray-800">
                  {runData.stats.pace}
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg border border-gray-200/50 text-center">
                <Mountain
                  className={`h-8 w-8 ${theme.iconColor} mx-auto mb-2`}
                />
                <p className="text-sm text-gray-600 font-medium">
                  Elevation Gain
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {runData.stats.elevation} m
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg border border-gray-200/50 text-center">
                <Target className={`h-8 w-8 ${theme.iconColor} mx-auto mb-2`} />
                <p className="text-sm text-gray-600 font-medium">
                  Pace Variance
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {runData.stats.paceVariance || 0.18}
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg border border-gray-200/50 text-center">
                <Activity
                  className={`h-8 w-8 ${theme.iconColor} mx-auto mb-2`}
                />
                <p className="text-sm text-gray-600 font-medium">
                  Fatigue Score
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {runData.stats.fatigueScore || 5.4}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🏃 Performance Metrics Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2
              className={`text-2xl font-bold ${theme.accentColor} flex items-center mb-2`}
            >
              🏃 Performance Metrics
            </h2>
            <p className="text-gray-600">
              Track your speed and elevation performance throughout the run
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pace per km */}
            <Card className={`${theme.cardBg} shadow-lg`}>
              <CardHeader>
                <CardTitle className={`text-xl font-bold ${theme.accentColor}`}>
                  Pace per Kilometer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <DetailedRunChart
                    title=""
                    type="line"
                    data={mockChartData.pacePerKm}
                    paceFormat={true}
                    height={300}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Climb Rate */}
            <Card className={`${theme.cardBg} shadow-lg`}>
              <CardHeader>
                <CardTitle className={`text-xl font-bold ${theme.accentColor}`}>
                  Climb Rate per Kilometer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <DetailedRunChart
                    title=""
                    type="line"
                    data={mockChartData.climbRate}
                    height={300}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 🎯 Consistency & Efficiency Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2
              className={`text-2xl font-bold ${theme.accentColor} flex items-center mb-2`}
            >
              🎯 Consistency & Efficiency
            </h2>
            <p className="text-gray-600">
              Analyze your pacing consistency and energy expenditure
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pace Variance */}
            <Card className={`${theme.cardBg} shadow-lg`}>
              <CardHeader>
                <CardTitle className={`text-xl font-bold ${theme.accentColor}`}>
                  Pace Variance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <DetailedRunChart
                    title=""
                    type="bar"
                    data={mockChartData.paceVariance}
                    height={300}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Calories per km */}
            <Card className={`${theme.cardBg} shadow-lg`}>
              <CardHeader>
                <CardTitle className={`text-xl font-bold ${theme.accentColor}`}>
                  Calories per Kilometer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <DetailedRunChart
                    title=""
                    type="bar"
                    data={mockChartData.caloriesPerKm}
                    height={300}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 🧠 Recovery & Load Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2
              className={`text-2xl font-bold ${theme.accentColor} flex items-center mb-2`}
            >
              🧠 Recovery & Load
            </h2>
            <p className="text-gray-600">
              Monitor your effort levels and recovery patterns
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Effort vs Fatigue */}
            <Card className={`${theme.cardBg} shadow-lg`}>
              <CardHeader>
                <CardTitle className={`text-xl font-bold ${theme.accentColor}`}>
                  Effort vs Fatigue Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <DetailedRunChart
                    title=""
                    type="line"
                    data={mockChartData.effortVsFatigue}
                    dualAxis={true}
                    height={300}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Summary */}
        <Card className={`${theme.cardBg} shadow-lg`}>
          <CardFooter className="pt-6">
            <div className="w-full text-center">
              <p className={`text-lg font-medium ${theme.accentColor} mb-2`}>
                Run Complete
              </p>
              <p className="text-gray-600">
                {runData.stats.pace} pace • {runData.stats.distance}km •{" "}
                {runData.date}
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
