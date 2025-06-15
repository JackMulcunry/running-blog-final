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
          `${import.meta.env.BASE_URL}data/runs/index.json`
        );
        const filenames: string[] = await indexRes.json();

        const runs = await Promise.all(
          filenames.map(async (filename) => {
            try {
              const res = await fetch(
                `${import.meta.env.BASE_URL}data/runs/${filename}`
              );
              const json = await res.json();

              // Ensure it has the basic required properties
              if (
                json &&
                json.id &&
                json.title &&
                json.chartData?.pace_per_km?.datasets?.[0]?.data
              ) {
                return json;
              } else {
                console.warn(`Skipping invalid run file: ${filename}`);
                return null;
              }
            } catch (err) {
              console.error(`Failed to load ${filename}:`, err);
              return null;
            }
          })
        );

        // Filter out any null values
        const validRuns = runs.filter((run) => run !== null);
        setRuns(validRuns as RunData[]);
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
          {Array.isArray(runs) &&
            runs.map((run) => (
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
