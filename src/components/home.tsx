import RunSummaryCard from "./RunSummaryCard";

interface HomeProps {
  onNavigateToAnalytics: (runId: string) => void;
}

function Home({ onNavigateToAnalytics }: HomeProps) {
  const sampleRuns = [
    {
      id: "1",
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
      id: "3",
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
    {
      id: "4",
      title: "June 6 - Speed Work",
      description:
        "Interval training session with 400m repeats. Great for building speed and cardiovascular fitness.",
      chartData: {
        labels: ["0km", "1km", "2km", "3km", "4km", "5km"],
        datasets: [
          {
            label: "Pace (min/km)",
            data: [5.0, 4.2, 5.5, 4.1, 5.8, 4.5],
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.2)",
          },
        ],
      },
    },
    {
      id: "5",
      title: "June 5 - Long Run",
      description:
        "Weekly long run building endurance for upcoming race. Maintained consistent effort throughout.",
      chartData: {
        labels: ["0km", "2km", "4km", "6km", "8km", "10km", "12km"],
        datasets: [
          {
            label: "Pace (min/km)",
            data: [5.3, 5.4, 5.2, 5.5, 5.6, 5.4, 5.7],
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.2)",
          },
        ],
      },
    },
    {
      id: "6",
      title: "June 4 - Tempo Run",
      description:
        "Comfortably hard tempo run to improve lactate threshold. Felt strong throughout the session.",
      chartData: {
        labels: ["0km", "1km", "2km", "3km", "4km", "5km", "6km"],
        datasets: [
          {
            label: "Pace (min/km)",
            data: [5.5, 4.8, 4.7, 4.9, 4.6, 4.8, 5.2],
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sampleRuns.map((run) => (
            <RunSummaryCard
              key={run.id}
              id={run.id}
              title={run.title}
              description={run.description}
              chartData={run.chartData}
              onNavigateToAnalytics={onNavigateToAnalytics}
            />
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
