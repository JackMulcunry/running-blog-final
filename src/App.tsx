import { Suspense, useState } from "react";
import Home from "./components/home";
import RunAnalyticsPage from "./pages/analytics/[id]";

function App() {
  const [currentView, setCurrentView] = useState<"home" | "analytics">("home");
  const [selectedRunId, setSelectedRunId] = useState<string>("");

  const handleNavigateToAnalytics = (runId: string) => {
    setSelectedRunId(runId);
    setCurrentView("analytics");
  };

  const handleNavigateHome = () => {
    setCurrentView("home");
    setSelectedRunId("");
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        {currentView === "home" && (
          <Home onNavigateToAnalytics={handleNavigateToAnalytics} />
        )}
        {currentView === "analytics" && (
          <RunAnalyticsPage
            runId={selectedRunId}
            onNavigateHome={handleNavigateHome}
          />
        )}
      </>
    </Suspense>
  );
}

export default App;
