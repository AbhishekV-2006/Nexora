/**
 * React Application Entry Point
 * 
 * TECHNOLOGY: React 18 with ReactDOM
 * WHY: Entry point mounts React app to DOM and enables React features
 * - Mounts App component to #root element in HTML
 * - StrictMode enables development-only checks for potential issues
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
