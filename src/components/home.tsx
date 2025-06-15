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
  const [errorLog, setErrorLog] = useState<string[]>([]);

  useEffect(() => {
    const loadRuns = async () => {
      const errorMessages: string[] = [];

      try {
        const indexUrl = `${import.meta.env.BASE_URL}data/runs/index.json`;
        const indexRes = await fetch(indexUrl);

        if (!indexRes.ok) {
          throw new Error(`Failed to fetch index.json (${indexRes.status})`);
        }

        const filenames: string[] = await indexRes.json();
        console.log(`📁 Found ${filenames.length} run files in index.json`);

        const results = await Promise.allSettled(
          filenames.map(async (filename) => {
            const fileUrl = `${import.meta.env.BASE_URL}data/runs/${filename}`;
            try {
              const res = await fetch(fileUrl);

              if (!res.ok) {
                throw new Error(`File not found (${res.status})`);
              }

              const data = await res.json();

              if (
                !data.chartData ||
                !data.chartData.pace_per_km ||
                !data.chartData.pace_per_km.datasets?.[0]?.data
              ) {
                throw new Error("Missing or malformed chartData");
              }

              return data;
            } catch (err: any) {
              const msg = `❌ Error loading ${filename}: ${err.message}`;
              console.error(msg);
              errorMessages.push(msg);
              return null;
            }
          })
        );

        const validRuns = results
          .filter((r) => r.status === "fulfilled" && r.value)
          .map((r: any) => r.value);

        setRuns(validRuns);
        setErrorLog(errorMessages);
      } catch (err: any) {
        const generalError = `🔥 Unexpected failure loading runs: ${err.message}`;
        console.error(generalError);
        setErrorLog((prev) => [...prev, generalError]);
      }
    };

    loadRuns();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {errorLog.length > 0 && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded mb-6">
            <h2 className="font-semibold mb-2">Errors while loading data:</h2>
            <ul className="text-sm list-disc pl-5 space-y-1">
              {errorLog.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

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
