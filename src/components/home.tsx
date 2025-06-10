import RunSummaryCard from "./RunSummaryCard";

interface HomeProps {
  onNavigateToAnalytics: (runId: string) => void;
}

function Home({ onNavigateToAnalytics }: HomeProps) {
  const sampleRuns = [
    {
      id: "1",
      type: "daily" as const,
      title: "June 9 - Morning Run",
      description:
        "Completed a 5K morning run with steady pace throughout. Weather was perfect with light breeze.",
      chartData: {
        labels: ["0km", "1km", "2km", "3km", "4km", "5km"],
        datasets: [
          {
            label: "Pace (min/km)",
            data: [5.2, 5.0, 5.1, 4.9, 5.0, 4.8],
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.2)",
          },
        ],
      },
    },
    {
      id: "2",
      type: "weekly" as const,
      title: "Week of June 3-9 - Training Block",
      description:
        "Solid training week with mix of easy runs, hill work, and speed sessions. Total: 42km across 6 runs.",
      chartData: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Distance (km)",
            data: [8, 0, 6, 10, 5, 13, 0],
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
          },
        ],
      },
      includedDates: [
        "June 3 – Easy Run",
        "June 5 – Hill Training",
        "June 6 – Speed Work",
        "June 7 – Recovery Run",
        "June 8 – Long Run",
        "June 9 – Morning Run",
      ],
    },
    {
      id: "3",
      type: "monthly" as const,
      title: "June 2024 - Building Base",
      description:
        "Strong month of base building with consistent mileage. Total: 180km across 24 runs. Average pace improved by 15 seconds.",
      chartData: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
          {
            label: "Weekly Distance (km)",
            data: [42, 45, 48, 45],
            borderColor: "rgb(147, 51, 234)",
            backgroundColor: "rgba(147, 51, 234, 0.2)",
          },
        ],
      },
      includedDates: [
        "Week 1 (June 1-7) – 42km",
        "Week 2 (June 8-14) – 45km",
        "Week 3 (June 15-21) – 48km",
        "Week 4 (June 22-28) – 45km",
      ],
    },
    {
      id: "4",
      type: "yearly" as const,
      title: "2024 - Marathon Training Year",
      description:
        "Comprehensive year of training leading to successful marathon completion. Total: 2,100km across 280 runs. 3 races completed including 1 marathon PR.",
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
            data: [120, 140, 160, 180, 200, 180, 220, 240, 200, 180, 160, 120],
            borderColor: "rgb(234, 179, 8)",
            backgroundColor: "rgba(234, 179, 8, 0.2)",
          },
        ],
      },
      includedDates: [
        "January – Base Building (120km)",
        "February – Consistency Focus (140km)",
        "March – Mileage Increase (160km)",
        "April – Speed Development (180km)",
        "May – Peak Training (200km)",
        "June – Maintenance (180km)",
        "July – Marathon Prep (220km)",
        "August – Peak Volume (240km)",
        "September – Taper & Race (200km)",
        "October – Recovery (180km)",
        "November – Easy Miles (160km)",
        "December – Off Season (120km)",
      ],
    },
    {
      id: "5",
      type: "daily" as const,
      title: "June 8 - Hill Training",
      description:
        "Challenging hill workout focusing on building strength and endurance. Pushed hard on the climbs.",
      chartData: {
        labels: ["0km", "1km", "2km", "3km", "4km", "5km", "6km"],
        datasets: [
          {
            label: "Pace (min/km)",
            data: [5.5, 6.2, 6.8, 5.9, 6.1, 5.7, 5.3],
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.2)",
          },
        ],
      },
    },
    {
      id: "6",
      type: "daily" as const,
      title: "June 7 - Recovery Run",
      description:
        "Easy-paced recovery run to help with muscle recovery. Focused on maintaining good form.",
      chartData: {
        labels: ["0km", "1km", "2km", "3km", "4km"],
        datasets: [
          {
            label: "Pace (min/km)",
            data: [6.0, 5.8, 5.9, 6.1, 5.7],
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.2)",
          },
        ],
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="text-green-600">Running</span> Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your progress, analyze your performance, and celebrate every
            mile
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12 max-w-7xl mx-auto">
          {sampleRuns.map((run) => (
            <div key={run.id} className="w-full">
              <RunSummaryCard
                id={run.id}
                type={run.type}
                title={run.title}
                description={run.description}
                chartData={run.chartData}
                includedDates={run.includedDates}
                onNavigateToAnalytics={onNavigateToAnalytics}
              />
            </div>
          ))}
        </div>

        {/* Container for n8n integration */}
        <div id="blog-posts" className="mt-12">
          {/* Dynamic content will be injected here by n8n */}
        </div>
      </div>
    </div>
  );
}

export default Home;
