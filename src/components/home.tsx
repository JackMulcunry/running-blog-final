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
  onNavigateToAnalytics: (runId: string, highlightedChart?: string) => void;
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

        // Sort by date descending (newest first) - most recent post appears in top left
        runs.sort((a, b) => {
          // Extract date from either the date field or the ID
          const getDate = (run: any) => {
            if (run.date) {
              return run.date;
            }
            // Extract date from ID format like "weekly-2025-06-22" or "daily-2025-06-24"
            const match = run.id.match(/(\d{4}-\d{2}-\d{2})/);
            return match ? match[1] : run.id;
          };

          const dateA = getDate(a);
          const dateB = getDate(b);

          return new Date(dateB).getTime() - new Date(dateA).getTime();
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
