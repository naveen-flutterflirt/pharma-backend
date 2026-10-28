"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
exports.dashboardRouter = (0, express_1.Router)();
// GET /api/dashboard/summary - Live Executive Operations Pulse
exports.dashboardRouter.get("/summary", dashboard_controller_1.getDashboardSummary);
// GET /api/dashboard/export/csv - Stream Executive MIS CSV
exports.dashboardRouter.get("/export/csv", dashboard_controller_1.exportDashboardMisCsv);
