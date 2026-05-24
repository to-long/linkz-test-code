import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeInit } from "./lib/theme";
import "./lib/i18n";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeInit />
    <App />
  </React.StrictMode>
);
