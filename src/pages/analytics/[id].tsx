import React, { useEffect, useState } from "react";
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
  BarChart3,
} from "lucide-react";
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
    cadence: number;
    speed: number;
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
          `${import.meta.env.BASE_URL}data/runs/${runId}.json`
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
        <p>Loading run data...</p>
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
    <div className={`min-h-screen ${theme.bgClass} pt-48 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button onClick={onNavigateHome}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Runs
          </Button>
        </div>

        {/* Header */}
        <Card className={`mb-8 ${theme.cardBg}`}>
          <CardHeader>
            <CardTitle className={`text-3xl font-bold ${theme.accentColor}`}>
              {runData.title}
            </CardTitle>
            <CardDescription className="text-gray-600 flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5" /> {runData.date}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4 text-lg">{runData.description}</p>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {runData.detailedDescription}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Card className={`mb-8 ${theme.cardBg}`}>
          <CardHeader>
            <CardTitle
              className={`text-2xl font-bold ${theme.accentColor} flex items-center`}
            >
              <BarChart3 className={`mr-3 h-6 w-6 ${theme.iconColor}`} />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {[
                {
                  label: "Distance",
                  value: `${runData.stats.distance} km`,
                  icon: <MapPin />,
                },
                {
                  label: "Duration",
                  value: runData.stats.duration,
                  icon: <Clock />,
                },
                {
                  label: "Pace",
                  value: runData.stats.pace,
                  icon: <TrendingUp />,
                },
                {
                  label: "Elevation",
                  value: `${runData.stats.elevation} m`,
                  icon: <Mountain />,
                },
                {
                  label: "Heart Rate",
                  value: `${runData.stats.heartRate} bpm`,
                  icon: <Heart />,
                },
                {
                  label: "Cadence",
                  value: `${runData.stats.cadence} rpm`,
                  icon: <Zap />,
                },
                {
                  label: "Speed",
                  value: `${runData.stats.speed} km/h`,
                  icon: <Activity />,
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white/60 p-4 rounded-lg border border-gray-200/50 text-center"
                >
                  <div className={`h-8 w-8 mx-auto mb-2 ${theme.iconColor}`}>
                    {stat.icon}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="space-y-12 mb-24">
          {Object.entries(runData.chartData).map(([key, chart]) => (
            <DetailedRunChart key={key} title={chart.label || key} data={chart} />
          ))}
        </div>
      </div>
    </div>
  );
}
