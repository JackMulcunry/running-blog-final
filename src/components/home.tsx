import React, { useEffect, useState } from "react";
import RunSummaryCard from "./RunSummaryCard";

interface RunData {
  id: string;
  title: string;
  date: string;
  description: string;
  detailedDescription: string;
  type: "daily" | "weekly" | "monthly" | "yearly";
  chartData: any;
  includedDates?: string[];
}

interface HomeProps {
  onNavigateToAnalytics: (runId: string) => void;
}

function Home({ onNavigateToAnalytics }: HomeProps) {
  const [runs, setRuns] = useState<RunData[]>([]);

  useEffect(() => {
    const loadRuns = async () => {
      try {
        const indexRes = await fetch(`${import.meta.env.BASE_URL}data/runs/index.json`)
        const filenames: string[] = await indexRes.json();

        const runs = await Promise.all(
          filenames.map(async (filename) => {
            const res = await fetch(`${import.meta.env.BASE_URL}data/runs/${filename}`);
            return await res.json();
          })
        );

        setRuns(runs);
      } catch (error) {
        console.error("Error loading runs:", error);
      }
    };

    loadRuns();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="text-green-600">Running</span> Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your progress, analyze your performance, and celebrate every mile
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12 max-w-7xl mx-auto">
          {runs.map((run) => (
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
      </div>
    </div>
  );
}

export default Home;
