import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import "./index.scss";
import "dread-ui/style.scss";
import { AppProvider } from "./providers/app-provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
);
