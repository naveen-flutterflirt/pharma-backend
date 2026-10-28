import { Router } from "express";
import * as settingsController from "../controllers/settings.controller";

export const settingsRouter = Router();

settingsRouter.get("/company", settingsController.getCompanySettings);
settingsRouter.put("/company", settingsController.updateCompanySettings);
settingsRouter.get("/staff", settingsController.getStaffList);
settingsRouter.post("/staff", settingsController.createStaffAccount);
settingsRouter.patch("/staff/:id", settingsController.updateStaffAccount);
settingsRouter.post("/test-gst", settingsController.testGstGateway);
settingsRouter.get("/audit-logs", settingsController.getAuditLogs);
settingsRouter.post("/audit-logs", settingsController.createAuditLog);
