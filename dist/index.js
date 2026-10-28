"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const prisma_1 = require("./db/prisma");
const routes_1 = require("./routes");
const app = (0, express_1.default)();
const PORT = env_1.config.PORT;
// Global Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (requestOrigin, callback) => {
        if (!requestOrigin)
            return callback(null, true);
        if (env_1.config.NODE_ENV !== "production")
            return callback(null, true);
        if (env_1.config.ALLOWED_ORIGINS.includes(requestOrigin)) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
// Root & Health check
app.get("/", (_req, res) => {
    res.json({
        service: "Pharma Distribution Management System (Pharma DMS) API",
        version: "1.0.0",
        architecture: "MVC (Model-View-Controller)",
        status: "online",
        docs: "/api/health"
    });
});
app.get("/api/health", async (_req, res) => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        return res.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            database: "connected",
            uptime: process.uptime()
        });
    }
    catch (error) {
        return res.status(503).json({
            status: "unhealthy",
            database: "disconnected",
            error: error.message
        });
    }
});
// Mount MVC API Master Router
app.use("/api", routes_1.apiRouter);
// 404 Handler
app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});
// Central Error Handler
app.use((err, _req, res, _next) => {
    console.error("Unhandled Exception:", err);
    res.status(500).json({
        error: err.message || "Internal Server Error",
        stack: env_1.config.NODE_ENV === "development" ? err.stack : undefined
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Pharma DMS Express Backend (MVC Architecture) running on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});
exports.default = app;
