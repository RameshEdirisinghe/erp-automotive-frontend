import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/AppRoutes";

const tw = document.createElement("script");
tw.src = "https://cdn.tailwindcss.com";
tw.onload = () => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <AppRoutes />
    </React.StrictMode>
  );
};
document.head.appendChild(tw);
