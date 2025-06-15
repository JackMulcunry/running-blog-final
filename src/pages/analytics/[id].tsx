
import React from "react";
import { useRouter } from "next/router";
import DetailedRunChart from "../../components/DetailedRunChart";
import { getRunDataById } from "../../lib/data";

const RunDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const runData = getRunDataById(id as string);

  if (!runData) {
    return <div>Run not found.</div>;
  }

  const isDaily = runData.type === "daily";

  return (
    <div className="max-w-6xl mx-auto mt-40 px-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">{runData.title}</h1>
      <p className="mb-4 text-gray-600">{runData.date}</p>
      <p className="mb-10">{runData.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(runData.chartData).map(([key, chart]: [string, any]) => {
          if (isDaily && key === "efficiency_score") return null;
          return (
            <DetailedRunChart key={key} title={chart.label || key} data={chart} />
          );
        })}
      </div>
    </div>
  );
};

export default RunDetailsPage;
