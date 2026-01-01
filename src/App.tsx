import { Suspense, useState } from "react";
import Home from "./components/home";
import BriefingPage from "./pages/briefing/[slug]";
import Admin from "./pages/Admin";
import WebsiteHeader from "./components/WebsiteHeader";

function App() {
  const [currentView, setCurrentView] = useState<"home" | "post" | "admin">("home");
  const [selectedSlug, setSelectedSlug] = useState<string>("");

  const handleNavigateToPost = (slug: string) => {
    setSelectedSlug(slug);
    setCurrentView("post");
  };

  const handleNavigateHome = () => {
    setCurrentView("home");
    setSelectedSlug("");
  };

  const handleNavigateToAdmin = () => {
    setCurrentView("admin");
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <WebsiteHeader onNavigateToAdmin={handleNavigateToAdmin} />
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
          {currentView === "admin" && (
            <Admin
              onNavigateToPost={handleNavigateToPost}
              onNavigateHome={handleNavigateHome}
            />
          )}
        </div>
      </>
    </Suspense>
  );
}

export default App;
