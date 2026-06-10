import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiRouter from "../routes/api";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global Middlewares
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  // Mount the dedicated backend routes folder
  app.use("/api", apiRouter);

  // Serve static assets / integrate frontend bundle via Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting backend in standard development mode with integrated Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting backend in production build mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // In Express v4, use app.get('*', ...). In Express v5, we use '*' as well.
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Portfolio Server active on port ${PORT} (0.0.0.0)`);
    console.log(`[Server] Root API context mounted at: http://localhost:${PORT}/api`);
  });
}

startServer().catch((error) => {
  console.error("Critical: Failed to launch backend services:", error);
  process.exit(1);
});
