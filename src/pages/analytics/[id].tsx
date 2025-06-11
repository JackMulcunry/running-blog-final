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
        const res = await fetch(`${import.meta.env.BASE_URL}data/runs/${runId}.json`); // Change to your actual endpoint if needed
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
              <h2 className="text-2xl font-bold text-red-500 mb-2">Run Not Found</h2>
              <p className="text-gray-600 mb-6">The run data you're looking for could not be found.</p>
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
      bgClass: "bg-gray-100",
      accentColor: "text-green-600",
      iconColor: "text-green-500",
    },
    weekly: {
      bgClass: "bg-blue-50",
      accentColor: "text-blue-600",
      iconColor: "text-blue-500",
    },
    monthly: {
      bgClass: "bg-purple-50",
      accentColor: "text-purple-600",
      iconColor: "text-purple-500",
    },
    yearly: {
      bgClass: "bg-yellow-50",
      accentColor: "text-yellow-600",
      iconColor: "text-yellow-500",
    },
  }[runData.type];

  return (
    <div className={`min-h-screen ${theme.bgClass} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={onNavigateHome}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Runs
          </Button>
        </div>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className={`text-2xl font-bold ${theme.accentColor}`}>{runData.title}</CardTitle>
            <CardDescription className="text-gray-500 flex items-center">
              <Calendar className="mr-2 h-4 w-4" /> {runData.date}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Run Overview</h3>
              <p className="text-gray-700 mb-4">{runData.description}</p>
              <div className="text-gray-700 whitespace-pre-line">{runData.detailedDescription}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card><CardContent className="pt-6"><div className="flex items-center"><MapPin className={`h-8 w-8 ${theme.iconColor} mr-3`} /><div><p className="text-sm text-gray-500">Distance</p><p className="text-xl font-bold">{runData.stats.distance} km</p></div></div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="flex items-center"><Clock className={`h-8 w-8 ${theme.iconColor} mr-3`} /><div><p className="text-sm text-gray-500">Duration</p><p className="text-xl font-bold">{runData.stats.duration}</p></div></div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="flex items-center"><TrendingUp className={`h-8 w-8 ${theme.iconColor} mr-3`} /><div><p className="text-sm text-gray-500">Pace</p><p className="text-xl font-bold">{runData.stats.pace}</p></div></div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="flex items-center"><Heart className={`h-8 w-8 ${theme.iconColor} mr-3`} /><div><p className="text-sm text-gray-500">Heart Rate</p><p className="text-xl font-bold">{runData.stats.heartRate} bpm</p></div></div></CardContent></Card>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4">Performance Analysis</h3>
              <div className="h-[400px]">
                <DetailedRunChart chartData={runData.chartData} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <div className="text-sm text-gray-500">
              <p>Pace: {runData.stats.pace} | Recorded on {runData.date}</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

