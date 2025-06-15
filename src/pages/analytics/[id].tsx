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
    <div className="pt-44 sm:pt-52 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900">{runData.title}</h1>
        <p className="text-gray-500">{runData.date}</p>
        <p className="mt-4 text-gray-700">{runData.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(runData.chartData).map(([key, chart]) => {
          if (isDaily && key === "efficiency_score") return null;
          return (
            <DetailedRunChart key={key} title={key} data={chart} />
          );
        })}
      </div>
    </div>
  );
};

export default RunDetailsPage;
