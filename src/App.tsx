import { Suspense, useState } from "react";
import Home from "./components/home";
import BriefingPage from "./pages/briefing/[slug]";
import WebsiteHeader from "./components/WebsiteHeader";

function App() {
  const [currentView, setCurrentView] = useState<"home" | "post">("home");
  const [selectedSlug, setSelectedSlug] = useState<string>("");

  const handleNavigateToPost = (slug: string) => {
    setSelectedSlug(slug);
    setCurrentView("post");
  };

  const handleNavigateHome = () => {
    setCurrentView("home");
    setSelectedSlug("");
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <WebsiteHeader />
        <div className="pt-40 sm:pt-44">
          {currentView === "home" && (
            <Home onNavigateToPost={handleNavigateToPost} />
          )}
          {currentView === "post" && (
            <BriefingPage
              slug={selectedSlug}
              onNavigateHome={handleNavigateHome}
            />
          )}
        </div>
      </>
    </Suspense>
  );
}

export default App;
