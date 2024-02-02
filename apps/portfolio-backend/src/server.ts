import express, { Express, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";

const app: Express = express();
const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;

// Middleware to serve static files
app.use(express.static("public"));

// Serve pathfinder-visualizer
app.use(
  "/pathfinder-visualizer",
  express.static(
    path.join(__dirname, "../../../apps/pathfinder-visualizer/dist"),
  ),
);

// Serve test-child
app.use(
  "/test-child",
  express.static(path.join(__dirname, "../../../apps/test-child/dist")),
);

// Serve app1
app.use(
  "/app1",
  createProxyMiddleware({
    target: "http://localhost:5173", // Target the Vite dev server
    changeOrigin: true,
    ws: true, // Proxy websockets if you're using features like HMR
    pathRewrite: { "^/app1": "" }, // Rewrite the URL path
    router: function (req) {
      // Dynamically route to the correct target based on the request path
      if (req.url.startsWith("/@vite") || req.url.startsWith("/src")) {
        return "http://localhost:5173";
      }
      // Default target
      return "http://localhost:5173";
    },
  }),
);

// // Serve app2
// app.use(
//   "/app2",
//   createProxyMiddleware({
//     target: "http://localhost:3002",
//     changeOrigin: true,
//     pathRewrite: { "^/app2": "" },
//   }),
// );

// Optionally, you can set up a catch-all route to handle undefined routes
// and redirect or respond with a default app or a 404 page
app.get("*", (req: Request, res: Response) => {
  // res.sendFile(path.join(__dirname, "../apps/defaultApp/index.html"));
  // Or send a 404 page
  res.status(404).send("App not found");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
