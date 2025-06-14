import { Suspense, useState } from "react";
import Home from "./components/home";
import RunAnalyticsPage from "./pages/analytics/[id]";
import WebsiteHeader from "./components/WebsiteHeader";

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
        <WebsiteHeader />
        <div className="pt-40 sm:pt-44">
          {currentView === "home" && (
            <Home onNavigateToAnalytics={handleNavigateToAnalytics} />
          )}
          {currentView === "analytics" && (
            <RunAnalyticsPage
              runId={selectedRunId}
              onNavigateHome={handleNavigateHome}
            />
          )}
        </div>
      </>
    </Suspense>
  );
}

export default App;
