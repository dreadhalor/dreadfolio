import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import "./index.scss";
import "test-ui/style.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
