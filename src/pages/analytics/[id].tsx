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
        );
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

        <Card className={`mb-8 ${theme.cardBg} shadow-lg`}>
          <CardHeader>
            <CardTitle className={`text-2xl font-bold ${theme.accentColor} flex items-center`}>
              <BarChart3 className={`mr-3 h-6 w-6 ${theme.iconColor}`} />
              📊 Performance Summary
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Essential metrics from your run
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {/* Metric Cards Here */}
              {/* ...unchanged... */}
            </div>
          </CardContent>
        </Card>

        <div className="mb-16">
          <div className="mb-6">
            <h2 className={`text-2xl font-bold ${theme.accentColor} flex items-center mb-2`}>
              🏃 Speed & Performance
            </h2>
            <p className="text-gray-600">
              Track your speed, cadence, and heart rate performance
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <DetailedRunChart
              title="Speed & Cadence Overview"
              data={runData.chartData.speed_cadence}
              dualAxis
            />
            <DetailedRunChart
              title="Heart Rate Analysis"
              type="bar"
              data={runData.chartData.heart_rate}
            />
          </div>
        </div>

        <div className="mb-16">
          <div className="mb-6">
            <h2 className={`text-2xl font-bold ${theme.accentColor} flex items-center mb-2`}>
              🎯 Efficiency & Elevation
            </h2>
            <p className="text-gray-600">
              Analyze your running efficiency and elevation profile
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <DetailedRunChart
              title="Running Efficiency Score"
              data={runData.chartData.efficiency_score}
            />
            <DetailedRunChart
              title="Elevation Summary"
              type="bar"
              data={runData.chartData.elevation_summary}
            />
          </div>
        </div>

        <Card className={`${theme.cardBg} shadow-lg`}>
          <CardFooter className="pt-6">
            <div className="w-full text-center">
              <p className={`text-lg font-medium ${theme.accentColor} mb-2`}>
                Run Complete
              </p>
              <p className="text-gray-600">
                {runData.stats.pace} pace • {runData.stats.distance}km • {runData.date}
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
