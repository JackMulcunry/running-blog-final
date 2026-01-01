import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import BriefingPage from "./pages/briefing/[slug]";
import Admin from "./pages/Admin";
import WebsiteHeader from "./components/WebsiteHeader";

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <WebsiteHeader />
          <div className="pt-40 sm:pt-44">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/posts/:slug" element={<BriefingPage />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
