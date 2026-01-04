import { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/home";
import BriefingPage from "./pages/briefing/[slug]";
import About from "./pages/About";
import Admin from "./pages/Admin";
import WebsiteHeader from "./components/WebsiteHeader";

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
  }
}

// Component to track pageviews on route changes
function Analytics() {
  const location = useLocation();

  useEffect(() => {
    // Send pageview to GA4 on route change
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
      });
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <WebsiteHeader />
          <div className="pt-24 sm:pt-28">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/posts/:slug" element={<BriefingPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
