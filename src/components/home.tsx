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
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const loadRuns = async () => {
      try {
        const indexRes = await fetch(`${import.meta.env.BASE_URL}data/runs/index.json`);
        const filenames: string[] = await indexRes.json();

        console.log(`📁 Found ${filenames.length} run files in index.json`);

        const errors: string[] = [];

        const results = await Promise.allSettled(
          filenames.map(async (filename) => {
            const fileUrl = `${import.meta.env.BASE_URL}data/runs/${filename}`;
            try {
              const res = await fetch(fileUrl);
              if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

              const json = await res.json();
              console.log(`📄 Loaded ${filename}`, json);

              // Sanity checks
              if (!json.chartData || typeof json.chartData !== "object") {
                throw new Error(`Missing or invalid chartData`);
              }

              return json;
            } catch (err: any) {
              const msg = `❌ Error loading ${filename}: ${err.message}`;
              console.error(msg);
              errors.push(msg);
              return null;
            }
          })
        );

        const validRuns = results
          .filter((r): r is PromiseFulfilledResult<RunData> => r.status === "fulfilled" && r.value !== null)
          .map((r) => r.value);

        setRuns(validRuns);
        setErrors(errors);
      } catch (err: any) {
        console.error("❌ Failed to load index.json:", err.message);
        setErrors([`Failed to load index.json: ${err.message}`]);
      }
    };

    loadRuns();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {errors.length > 0 && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
            <p className="font-bold mb-2">Some runs failed to load:</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
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
