import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env";
import { prisma } from "./db/prisma";
import { apiRouter } from "./routes";

const app = express();
const PORT = config.PORT;

// Global Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true);
      if (config.NODE_ENV !== "production") return callback(null, true);
      if (config.ALLOWED_ORIGINS.includes(requestOrigin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
);
app.use(morgan("dev"));
app.use(express.json());

// Root & Health check
app.get("/", (_req: Request, res: Response) => {
  res.json({
    service: "Pharma Distribution Management System (Pharma DMS) API",
    version: "1.0.0",
    architecture: "MVC (Model-View-Controller)",
    status: "online",
    docs: "/api/health"
  });
});

app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      uptime: process.uptime()
    });
  } catch (error: any) {
    return res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message
    });
  }
});

// Mount MVC API Master Router
app.use("/api", apiRouter);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Central Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Exception:", err);
  res.status(500).json({
    error: err.message || "Internal Server Error",
    stack: config.NODE_ENV === "development" ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Pharma DMS Express Backend (MVC Architecture) running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});

export default app;
