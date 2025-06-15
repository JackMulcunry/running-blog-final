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
    heartRate?: number;
    climbPerKm?: number;
    effortScore?: number;
    effortPerKm?: number;
    elevationPercentPerKm?: number;
    paceVariance?: number;
    fatigueScore?: number;
  };
  chartData: any;
  includedDates?: string[];
}

interface RunAnalyticsPageProps {
  runId: string;
  onNavigateHome: () => void;
}

export default function RunAnalyticsPage({ runId, onNavigateHome }: RunAnalyticsPageProps) {
  const [runData, setRunData] = useState<RunData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRunData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/runs/${runId}.json`);
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

  const theme = {
    daily: {
      bgClass: "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100",
      accentColor: "text-amber-700",
      iconColor: "text-amber-600",
      cardBg: "bg-white",
    },
    weekly: {
      bgClass: "bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100",
      accentColor: "text-blue-700",
      iconColor: "text-blue-600",
      cardBg: "bg-white",
    },
    monthly: {
      bgClass: "bg-gradient-to-br from-purple-50 via-slate-50 to-purple-100",
      accentColor: "text-purple-700",
      iconColor: "text-purple-600",
      cardBg: "bg-white",
    },
    yearly: {
      bgClass: "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100",
      accentColor: "text-orange-700",
      iconColor: "text-orange-600",
      cardBg: "bg-white",
    },
  }[runData?.type || "daily"] ?? {
    bgClass: "bg-gray-50",
    accentColor: "text-gray-700",
    iconColor: "text-gray-500",
    cardBg: "bg-white",
  };

  if (loading) {
    return <div className="text-center p-6">Loading run data...</div>;
  }

  if (!runData) {
    return <div className="text-center p-6">Run data not found.</div>;
  }

  return (
    <div className={`min-h-screen ${theme.bgClass} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button onClick={onNavigateHome} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Runs
          </Button>
        </div>

        <Card className={`mb-8 ${theme.cardBg} shadow-lg`}>
          <CardHeader>
            <CardTitle className={`text-3xl font-bold ${theme.accentColor}`}>{runData.title}</CardTitle>
            <CardDescription className="text-gray-600 flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5" /> {runData.date}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4 text-lg leading-relaxed">{runData.description}</p>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {runData.detailedDescription}
            </div>
          </CardContent>
        </Card>

        {runData.stats && runData.stats.distance && (
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
                {/* Example metrics - ensure all values exist in stats */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">Distance</p>
                  <p className="text-xl font-semibold">{runData.stats.distance} km</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-xl font-semibold">{runData.stats.duration}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Pace</p>
                  <p className="text-xl font-semibold">{runData.stats.pace}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Elevation</p>
                  <p className="text-xl font-semibold">{runData.stats.elevation} m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-16">
          <h2 className={`text-2xl font-bold ${theme.accentColor} mb-2`}>🏃 Speed & Performance</h2>
          <p className="text-gray-600 mb-4">Track your speed, cadence, and heart rate performance</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className={`${theme.cardBg} shadow-md`}>
              <CardContent className="pt-6">
                <DetailedRunChart
                  title="Speed & Cadence Overview"
                  data={runData.chartData.speed_cadence}
                  dualAxis
                />
              </CardContent>
            </Card>
            <Card className={`${theme.cardBg} shadow-md`}>
              <CardContent className="pt-6">
                <DetailedRunChart
                  title="Heart Rate Analysis"
                  type="bar"
                  data={runData.chartData.heart_rate}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-16">
          <h2 className={`text-2xl font-bold ${theme.accentColor} mb-2`}>🎯 Efficiency & Elevation</h2>
          <p className="text-gray-600 mb-4">Analyze your running efficiency and elevation profile</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {runData.type !== "daily" && (
              <Card className={`${theme.cardBg} shadow-md`}>
                <CardContent className="pt-6">
                  <DetailedRunChart
                    title="Running Efficiency Score"
                    data={runData.chartData.efficiency_score}
                  />
                </CardContent>
              </Card>
            )}
            <Card className={`${theme.cardBg} shadow-md`}>
              <CardContent className="pt-6">
                <DetailedRunChart
                  title="Elevation Summary"
                  type="bar"
                  data={runData.chartData.elevation_summary}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
