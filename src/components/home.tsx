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
        const indexRes = await fetch(
          `${import.meta.env.BASE_URL}data/runs/index.json`,
        );
        const filenames: string[] = await indexRes.json();

        const runs = await Promise.all(
          filenames.map(async (filename) => {
            const res = await fetch(
              `${import.meta.env.BASE_URL}data/runs/${filename}`,
            );
            return await res.json();
          }),
        );

        // Sort with weekly cards first, then by date descending (newest first)
        runs.sort((a, b) => {
          // Weekly cards always come first
          if (a.type === "weekly" && b.type !== "weekly") return -1;
          if (b.type === "weekly" && a.type !== "weekly") return 1;

          // If both are weekly or both are not weekly, sort by date
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setRuns(runs);
      } catch (error) {
        console.error("Error loading runs:", error);
      }
    };

    loadRuns();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
