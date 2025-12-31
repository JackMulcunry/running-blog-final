import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Only initialize Tempo Devtools in development
if (import.meta.env.DEV) {
  import("tempo-devtools").then(({ TempoDevtools }) => {
    TempoDevtools.init();
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
