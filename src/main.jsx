import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx"; // your existing optimizer UI
import LandingPage from "./pages/LandingPage.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Set your subpath here (e.g., GitHub Pages repo name) */}
    <BrowserRouter basename="/dnd2024-class-optimizer">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dnd-class-optimizer" element={<App />} />
        {/* Fallback to hero if an unknown path is visited */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
