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
  stats: {
    distance: number;
    duration: string;
    pace: string;
    elevation: number;
    heartRate: number;
  };
  chartData: any; // This would be properly typed based on Chart.js requirements
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
    // In a real app, this would fetch data from an API
    // For now, we'll simulate loading data
    const fetchRunData = async () => {
      setLoading(true);
      try {
        // Simulated API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock data
        const mockData: RunData = {
          id: runId || "1",
          title: `Run on June ${parseInt(runId || "1") + 8}, 2023`,
          date: `2023-06-${parseInt(runId || "1") + 8}`,
          description: "Morning run through the park with some hill training.",
          detailedDescription:
            "This morning run started at sunrise, with perfect weather conditions. I focused on maintaining a steady pace during the flat sections and pushing hard on the hills. The route took me through the scenic park trails with beautiful views of the lake. I felt strong throughout most of the run, though I did experience some fatigue in the final mile. Overall, this was one of my better training sessions this month, and I can see improvements in my hill climbing ability compared to previous weeks.",
          stats: {
            distance: 8.2,
            duration: "45:32",
            pace: "5:33/km",
            elevation: 124,
            heartRate: 152,
          },
          chartData: {
            // This would contain the data for Chart.js
            labels: [
              "0km",
              "1km",
              "2km",
              "3km",
              "4km",
              "5km",
              "6km",
              "7km",
              "8km",
            ],
            datasets: [
              {
                label: "Pace (min/km)",
                data: [5.8, 5.5, 5.9, 6.2, 5.7, 5.4, 5.6, 5.3, 5.1],
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                fill: true,
              },
              {
                label: "Heart Rate (bpm)",
                data: [130, 145, 155, 160, 158, 152, 156, 162, 165],
                borderColor: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                fill: true,
                yAxisID: "y1",
              },
              {
                label: "Elevation (m)",
                data: [10, 15, 25, 45, 30, 20, 35, 50, 15],
                borderColor: "#6366f1",
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                fill: true,
                yAxisID: "y2",
              },
            ],
          },
        };

        setRunData(mockData);
      } catch (error) {
        console.error("Error fetching run data:", error);
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={onNavigateHome}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Runs
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-green-600">
              {runData.title}
            </CardTitle>
            <CardDescription className="text-gray-500 flex items-center">
              <Calendar className="mr-2 h-4 w-4" /> {runData.date}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Run Overview</h3>
              <p className="text-gray-700 mb-4">{runData.description}</p>
              <div className="text-gray-700 whitespace-pre-line">
                {runData.detailedDescription}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <MapPin className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Distance</p>
                      <p className="text-xl font-bold">
                        {runData.stats.distance} km
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="text-xl font-bold">
                        {runData.stats.duration}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Elevation Gain</p>
                      <p className="text-xl font-bold">
                        {runData.stats.elevation} m
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Heart className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Avg Heart Rate</p>
                      <p className="text-xl font-bold">
                        {runData.stats.heartRate} bpm
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
              <p>
                Pace: {runData.stats.pace} | Recorded on {runData.date}
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
