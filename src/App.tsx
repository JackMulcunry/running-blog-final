import { Suspense, useState } from "react";
import Home from "./components/home";
import RunAnalyticsPage from "./pages/analytics/[id]";
import WebsiteHeader from "./components/WebsiteHeader";

function App() {
  const [currentView, setCurrentView] = useState<"home" | "analytics">("home");
  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const [highlightedChart, setHighlightedChart] = useState<string | undefined>(
    undefined,
  );

  const handleNavigateToAnalytics = (
    runId: string,
    highlightedChart?: string,
  ) => {
    setSelectedRunId(runId);
    setHighlightedChart(highlightedChart);
    setCurrentView("analytics");
  };

  const handleNavigateHome = () => {
    setCurrentView("home");
    setSelectedRunId("");
    setHighlightedChart(undefined);
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <WebsiteHeader />
        <div className="pt-40 sm:pt-44">
          {currentView === "home" && (
            <Home onNavigateToAnalytics={handleNavigateToAnalytics} />
          )}
          {currentView === "analytics" && (
            <RunAnalyticsPage
              runId={selectedRunId}
              onNavigateHome={handleNavigateHome}
              highlightedChart={highlightedChart}
            />
          )}
        </div>
      </>
    </Suspense>
  );
}

export default App;
