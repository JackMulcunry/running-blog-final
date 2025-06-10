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
  chartData: any; // This would be properly typed based on Chart.js requirements
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
    // In a real app, this would fetch data from an API
    // For now, we'll simulate loading data
    const fetchRunData = async () => {
      setLoading(true);
      try {
        // Simulated API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock data based on runId to simulate different summary types
        const getMockData = (id: string): RunData => {
          const summaryTypes = {
            "1": "daily",
            "2": "weekly",
            "3": "monthly",
            "4": "yearly",
            "5": "daily",
            "6": "daily",
          } as const;

          const type = summaryTypes[id as keyof typeof summaryTypes] || "daily";

          if (type === "weekly") {
            return {
              id,
              type: "weekly",
              title: "Week of June 3-9 - Training Block",
              date: "June 3-9, 2024",
              description:
                "Solid training week with mix of easy runs, hill work, and speed sessions.",
              detailedDescription:
                "This week represented a perfect balance of training intensities. Started with an easy Monday run to shake off weekend fatigue, followed by targeted hill work on Wednesday that really challenged my climbing strength. The speed session on Thursday felt controlled and powerful, while Friday's recovery run helped prepare for Saturday's long run. The 13km long run on Saturday was the week's highlight - felt strong throughout and maintained good form even as fatigue set in during the final kilometers.",
              stats: {
                distance: 42,
                duration: "5:15:00",
                pace: "5:30/km",
                elevation: 420,
                heartRate: 145,
              },
              chartData: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [
                  {
                    label: "Distance (km)",
                    data: [8, 0, 6, 10, 5, 13, 0],
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    fill: true,
                  },
                ],
              },
              includedDates: [
                "June 3 – Easy Run (8km)",
                "June 5 – Hill Training (6km)",
                "June 6 – Speed Work (10km)",
                "June 7 – Recovery Run (5km)",
                "June 8 – Long Run (13km)",
              ],
            };
          } else if (type === "monthly") {
            return {
              id,
              type: "monthly",
              title: "June 2024 - Building Base",
              date: "June 2024",
              description:
                "Strong month of base building with consistent mileage and improved pacing.",
              detailedDescription:
                "June marked a significant step forward in my training consistency. Each week built upon the last, with a focus on aerobic base development and gradual mileage increases. The month started conservatively but by week 3, I was hitting my highest weekly volumes of the year. What's most encouraging is how my average pace improved by 15 seconds per kilometer while maintaining the same perceived effort levels. This suggests real fitness gains and improved running economy.",
              stats: {
                distance: 180,
                duration: "16:30:00",
                pace: "5:30/km",
                elevation: 1240,
                heartRate: 142,
              },
              chartData: {
                labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                datasets: [
                  {
                    label: "Weekly Distance (km)",
                    data: [42, 45, 48, 45],
                    borderColor: "#9333ea",
                    backgroundColor: "rgba(147, 51, 234, 0.1)",
                    fill: true,
                  },
                ],
              },
              includedDates: [
                "Week 1 (June 1-7) – 42km, 6 runs",
                "Week 2 (June 8-14) – 45km, 6 runs",
                "Week 3 (June 15-21) – 48km, 7 runs",
                "Week 4 (June 22-28) – 45km, 6 runs",
              ],
            };
          } else if (type === "yearly") {
            return {
              id,
              type: "yearly",
              title: "2024 - Marathon Training Year",
              date: "2024",
              description:
                "Comprehensive year of training leading to successful marathon completion.",
              detailedDescription:
                "2024 will be remembered as the year everything came together. What started as an ambitious goal to run my first marathon became a journey of discovery about my capabilities as a runner. The year was methodically planned with distinct phases: base building through spring, speed development in early summer, peak training through late summer, and the successful marathon campaign in fall. Beyond the numbers, this year taught me about consistency, patience, and the power of incremental progress.",
              stats: {
                distance: 2100,
                duration: "175:00:00",
                pace: "5:00/km",
                elevation: 15600,
                heartRate: 140,
              },
              chartData: {
                labels: [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
                datasets: [
                  {
                    label: "Monthly Distance (km)",
                    data: [
                      120, 140, 160, 180, 200, 180, 220, 240, 200, 180, 160,
                      120,
                    ],
                    borderColor: "#eab308",
                    backgroundColor: "rgba(234, 179, 8, 0.1)",
                    fill: true,
                  },
                ],
              },
              includedDates: [
                "January – Base Building (120km, 18 runs)",
                "February – Consistency Focus (140km, 20 runs)",
                "March – Mileage Increase (160km, 22 runs)",
                "April – Speed Development (180km, 24 runs)",
                "May – Peak Training (200km, 26 runs)",
                "June – Maintenance (180km, 24 runs)",
                "July – Marathon Prep (220km, 28 runs)",
                "August – Peak Volume (240km, 30 runs)",
                "September – Taper & Race (200km, 22 runs)",
                "October – Recovery (180km, 20 runs)",
                "November – Easy Miles (160km, 18 runs)",
                "December – Off Season (120km, 16 runs)",
              ],
            };
          } else {
            return {
              id,
              type: "daily",
              title: `Run on June ${parseInt(id) + 8}, 2024`,
              date: `2024-06-${parseInt(id) + 8}`,
              description:
                "Morning run through the park with some hill training.",
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
          }
        };

        const mockData = getMockData(runId || "1");

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

  // Get theme configuration based on summary type
  const getThemeConfig = (type: string) => {
    const configs = {
      daily: {
        bgClass: "bg-gray-100",
        headerBg: "bg-white",
        accentColor: "text-green-600",
        iconColor: "text-green-500",
        cardBg: "bg-white",
      },
      weekly: {
        bgClass: "bg-blue-50",
        headerBg: "bg-blue-600",
        accentColor: "text-blue-600",
        iconColor: "text-blue-500",
        cardBg: "bg-white",
      },
      monthly: {
        bgClass: "bg-purple-50",
        headerBg: "bg-purple-600",
        accentColor: "text-purple-600",
        iconColor: "text-purple-500",
        cardBg: "bg-white",
      },
      yearly: {
        bgClass: "bg-yellow-50",
        headerBg: "bg-yellow-600",
        accentColor: "text-yellow-600",
        iconColor: "text-yellow-500",
        cardBg: "bg-white",
      },
    };
    return configs[type as keyof typeof configs] || configs.daily;
  };

  const theme = getThemeConfig(runData.type);

  // Render different layouts based on summary type
  const renderWeeklyLayout = () => (
    <div className={`min-h-screen ${theme.bgClass} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={onNavigateHome}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Runs
          </Button>
        </div>

        {/* Blue header bar */}
        <div className={`${theme.headerBg} text-white p-6 rounded-t-lg mb-0`}>
          <h1 className="text-3xl font-bold mb-2">{runData.title}</h1>
          <p className="text-blue-100 flex items-center">
            <Calendar className="mr-2 h-4 w-4" /> {runData.date}
          </p>
        </div>

        <Card className="mb-8 rounded-t-none">
          <CardContent className="pt-6">
            <div className="mb-12 px-6">
              <p className="text-gray-700 mb-8">{runData.description}</p>
              <div className="text-gray-700">{runData.detailedDescription}</div>
            </div>

            {/* Weekly stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 px-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <MapPin className={`h-8 w-8 ${theme.iconColor} mr-3`} />
                    <div>
                      <p className="text-sm text-gray-500">Total Distance</p>
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
                    <Clock className={`h-8 w-8 ${theme.iconColor} mr-3`} />
                    <div>
                      <p className="text-sm text-gray-500">Total Time</p>
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
                    <TrendingUp className={`h-8 w-8 ${theme.iconColor} mr-3`} />
                    <div>
                      <p className="text-sm text-gray-500">Avg Pace</p>
                      <p className="text-xl font-bold">{runData.stats.pace}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Heart className={`h-8 w-8 ${theme.iconColor} mr-3`} />
                    <div>
                      <p className="text-sm text-gray-500">Avg HR</p>
                      <p className="text-xl font-bold">
                        {runData.stats.heartRate} bpm
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily breakdown chart */}
            <div className="mb-16 px-6">
              <h3 className={`text-xl font-bold ${theme.accentColor} mb-8`}>
                Daily Breakdown
              </h3>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="h-[350px]">
                  <DetailedRunChart chartData={runData.chartData} />
                </div>
              </div>
            </div>

            {/* Highlights of the Week */}
            <div className="mb-16 px-6">
              <h3 className={`text-xl font-bold ${theme.accentColor} mb-8`}>
                Highlights of the Week
              </h3>
              <Card className="rounded-lg">
                <CardContent className="pt-10 px-10">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <span>
                        Completed longest run of the month (13km) with strong
                        finish
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <span>
                        Hill training session showed improved climbing strength
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <span>
                        Speed work felt controlled and powerful throughout
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <span>
                        Perfect balance of training intensities achieved
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Included runs */}
            {runData.includedDates && (
              <div className="px-6">
                <h3 className={`text-xl font-bold ${theme.accentColor} mb-8`}>
                  Runs This Week
                </h3>
                <Card className="rounded-lg">
                  <CardContent className="pt-10 px-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {runData.includedDates.map((date, index) => (
                        <div
                          key={index}
                          className="flex items-center p-4 bg-blue-50 rounded-lg"
                        >
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
                          <span className="text-sm">{date}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMonthlyLayout = () => (
    <div className={`min-h-screen ${theme.bgClass} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={onNavigateHome}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Runs
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader className="bg-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold">
              {runData.title}
            </CardTitle>
            <CardDescription className="text-purple-100 flex items-center">
              <Calendar className="mr-2 h-4 w-4" /> {runData.date}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-12 px-6">
              <p className="text-gray-700 mb-8">{runData.description}</p>
              <div className="text-gray-700">{runData.detailedDescription}</div>
            </div>

            {/* Monthly stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 px-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <MapPin className={`h-8 w-8 ${theme.iconColor} mr-3`} />
                    <div>
                      <p className="text-sm text-gray-500">Total Distance</p>
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
                    <Clock className={`h-8 w-8 ${theme.iconColor} mr-3`} />
                    <div>
                      <p className="text-sm text-gray-500">Total Time</p>
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
                    <TrendingUp className={`h-8 w-8 ${theme.iconColor} mr-3`} />
                    <div>
                      <p className="text-sm text-gray-500">Avg Pace</p>
                      <p className="text-xl font-bold">{runData.stats.pace}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Heart className={`h-8 w-8 ${theme.iconColor} mr-3`} />
                    <div>
                      <p className="text-sm text-gray-500">Avg HR</p>
                      <p className="text-xl font-bold">
                        {runData.stats.heartRate} bpm
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly trends chart */}
            <div className="mb-16 px-6">
              <h3 className={`text-xl font-bold ${theme.accentColor} mb-8`}>
                Monthly Trends
              </h3>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="h-[350px]">
                  <DetailedRunChart chartData={runData.chartData} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-6">
              {/* Focus Area */}
              <div className="mb-12">
                <h3 className={`text-xl font-bold ${theme.accentColor} mb-8`}>
                  Focus Area: Base Building
                </h3>
                <Card className="rounded-lg">
                  <CardContent className="pt-10 px-10">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                        <span className="font-medium">Aerobic Development</span>
                        <span className="text-purple-600 font-bold">85%</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                        <span className="font-medium">Consistency</span>
                        <span className="text-purple-600 font-bold">92%</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                        <span className="font-medium">Pace Improvement</span>
                        <span className="text-purple-600 font-bold">
                          15s/km
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline */}
              <div className="mb-12">
                <h3 className={`text-xl font-bold ${theme.accentColor} mb-8`}>
                  Weekly Timeline
                </h3>
                <Card className="rounded-lg">
                  <CardContent className="pt-10 px-10">
                    <div className="space-y-8">
                      {runData.includedDates?.map((week, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-4 h-4 bg-purple-500 rounded-full mr-8 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="h-px bg-purple-200 w-full"></div>
                          </div>
                          <div className="ml-8 text-sm text-gray-600">
                            {week}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderYearlyLayout = () => (
    <div className={`min-h-screen ${theme.bgClass}`}>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-yellow-600 text-white p-6 min-h-screen">
          <Button
            variant="outline"
            onClick={onNavigateHome}
            className="mb-6 text-yellow-600 border-white hover:bg-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Runs
          </Button>

          <h1 className="text-2xl font-bold mb-2">{runData.title}</h1>
          <p className="text-yellow-100 mb-8 flex items-center">
            <Calendar className="mr-2 h-4 w-4" /> {runData.date}
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Year Overview</h3>
              <p className="text-yellow-100 text-sm">{runData.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-yellow-100">Total Distance</span>
                  <span className="font-bold">{runData.stats.distance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-100">Total Time</span>
                  <span className="font-bold">{runData.stats.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-100">Avg Pace</span>
                  <span className="font-bold">{runData.stats.pace}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-100">Avg HR</span>
                  <span className="font-bold">
                    {runData.stats.heartRate} bpm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <p className="text-gray-700">{runData.detailedDescription}</p>
            </div>

            {/* Year in Stats */}
            <div className="mb-8">
              <h2 className={`text-2xl font-bold ${theme.accentColor} mb-6`}>
                Year in Stats
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      2,100
                    </div>
                    <div className="text-gray-500">Total Kilometers</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      280
                    </div>
                    <div className="text-gray-500">Total Runs</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      3
                    </div>
                    <div className="text-gray-500">Races Completed</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Monthly Mileage Breakdown */}
            <div className="mb-8">
              <h2 className={`text-2xl font-bold ${theme.accentColor} mb-6`}>
                Monthly Mileage Breakdown
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="h-[400px]">
                    <DetailedRunChart chartData={runData.chartData} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements Grid */}
            <div className="mb-8">
              <h2 className={`text-2xl font-bold ${theme.accentColor} mb-6`}>
                Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Marathon PR</h3>
                      <p className="text-sm text-gray-600">
                        3:45:22 - Boston Qualifier!
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MapPin className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Longest Run</h3>
                      <p className="text-sm text-gray-600">35km training run</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Heart className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Consistency</h3>
                      <p className="text-sm text-gray-600">
                        280 runs, 23 runs/month avg
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Fastest 5K</h3>
                      <p className="text-sm text-gray-600">22:15 - New PB!</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Peak Month</h3>
                      <p className="text-sm text-gray-600">240km in August</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MapPin className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Elevation Gain</h3>
                      <p className="text-sm text-gray-600">
                        15,600m total climbing
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Monthly breakdown */}
            <div>
              <h2 className={`text-2xl font-bold ${theme.accentColor} mb-6`}>
                Monthly Journey
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {runData.includedDates?.map((month, index) => (
                      <div key={index} className="p-4 bg-yellow-50 rounded-lg">
                        <div className="text-sm text-gray-600">{month}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDailyLayout = () => (
    <div className={`min-h-screen ${theme.bgClass} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={onNavigateHome}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Runs
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className={`text-2xl font-bold ${theme.accentColor}`}>
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
                    <MapPin className={`h-8 w-8 ${theme.iconColor} mr-3`} />
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
                    <Clock className={`h-8 w-8 ${theme.iconColor} mr-3`} />
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
                    <TrendingUp className={`h-8 w-8 ${theme.iconColor} mr-3`} />
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
                    <Heart className={`h-8 w-8 ${theme.iconColor} mr-3`} />
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

  // Render appropriate layout based on summary type
  switch (runData.type) {
    case "weekly":
      return renderWeeklyLayout();
    case "monthly":
      return renderMonthlyLayout();
    case "yearly":
      return renderYearlyLayout();
    default:
      return renderDailyLayout();
  }
}
