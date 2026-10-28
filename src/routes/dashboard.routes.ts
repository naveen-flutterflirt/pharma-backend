import { Router } from "express";
import { getDashboardSummary, exportDashboardMisCsv } from "../controllers/dashboard.controller";

export const dashboardRouter = Router();

// GET /api/dashboard/summary - Live Executive Operations Pulse
dashboardRouter.get("/summary", getDashboardSummary);

// GET /api/dashboard/export/csv - Stream Executive MIS CSV
dashboardRouter.get("/export/csv", exportDashboardMisCsv);
