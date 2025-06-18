import React, { useState, useEffect } from "react";
import DetailedRunChart from "../../components/DetailedRunChart";
import { Button } from "../../components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Zap,
  Mountain,
  Heart,
  Target,
} from "lucide-react";

interface RunAnalyticsPageProps {
  runId: string;
  onNavigateHome: () => void;
}

interface RunData {
  id: string;
  title: string;
  date: string;
  description: string;
  detailedDescription: string;
  type: string;
  stats: {
    distance: number;
    duration: string;
    pace: string;
    elevation: number;
    climb_per_km: number;
    avg_speed_kph: number;
    max_speed_kph: number;
    avg_cadence_rpm: number;
    avg_heartrate_bpm: number;
    max_heartrate_bpm: number;
    efficiency_score: number;
    elevation_low_m: number;
    elevation_high_m: number;
  };
  chartData: Record<string, any>;
}

const RunAnalyticsPage = ({ runId, onNavigateHome }: RunAnalyticsPageProps) => {
  const [runData, setRunData] = useState<RunData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRunData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/running-blog-final/data/runs/${runId}.json`,
        );
        if (!response.ok) {
          throw new Error("Run data not found");
        }
        const data = await response.json();
        setRunData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load run data",
        );
      } finally {
        setLoading(false);
      }
    };

    if (runId) {
      fetchRunData();
    }
  }, [runId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading run data...</p>
        </div>
      </div>
    );
  }

  if (error || !runData) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Run not found"}</p>
          <Button onClick={onNavigateHome} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const isDaily = runData.type === "daily";

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button onClick={onNavigateHome} variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {runData.title}
            </h1>
            <p className="text-lg text-gray-600 mb-4">{runData.date}</p>
            <p className="text-gray-700 leading-relaxed">
              {runData.detailedDescription}
            </p>
          </div>
        </div>

        {/* Goal Focus Section */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-amber-200 rounded-lg shadow-md p-6 mb-8 mt-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 to-orange-100/20 rounded-lg"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <Target className="w-5 h-5 text-amber-600 mr-2" />
              Goal Focus
            </h2>
            <p className="text-gray-700 italic leading-relaxed">
              Focus on improving running efficiency during interval sessions.
              Fine-tuning form and pacing could help maintain speed with lower
              effort, leading to better overall performance.
            </p>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Performance Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="w-5 h-5 text-green-600 mr-1" />
                <div className="text-2xl font-bold text-green-600">
                  {runData.stats.distance}km
                </div>
              </div>
              <div className="text-sm text-gray-500">Distance</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-blue-600 mr-1" />
                <div className="text-2xl font-bold text-blue-600">
                  {runData.stats.duration}
                </div>
              </div>
              <div className="text-sm text-gray-500">Duration</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-purple-600 mr-1" />
                <div className="text-2xl font-bold text-purple-600">
                  {runData.stats.pace}
                </div>
              </div>
              <div className="text-sm text-gray-500">Avg Pace (m/km)</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Mountain className="w-5 h-5 text-yellow-600 mr-1" />
                <div className="text-2xl font-bold text-yellow-600">
                  {runData.stats.elevation}m
                </div>
              </div>
              <div className="text-sm text-gray-500">Elevation</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="w-5 h-5 text-red-600 mr-1" />
                <div className="text-2xl font-bold text-red-600">
                  {runData.stats.avg_heartrate_bpm}
                </div>
              </div>
              <div className="text-sm text-gray-500">Avg HR</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-5 h-5 text-indigo-600 mr-1" />
                <div className="text-2xl font-bold text-indigo-600">
                  {runData.stats.efficiency_score}
                </div>
              </div>
              <div className="text-sm text-gray-500">Efficiency</div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(runData.chartData).map(([key, chart]) => {
            if (isDaily && key === "efficiency_score") return null;
            return (
              <div key={key} className="bg-white rounded-lg shadow-sm">
                <DetailedRunChart
                  title={key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                  data={chart}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RunAnalyticsPage;
