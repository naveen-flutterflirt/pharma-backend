import { Router } from "express";
import * as reportsController from "../controllers/reports.controller";

export const reportsRouter = Router();

reportsRouter.get("/kpis", reportsController.getReportsKpis);
reportsRouter.get("/sales", reportsController.getReportsSales);
reportsRouter.get("/stock", reportsController.getReportsStock);
reportsRouter.get("/outstanding", reportsController.getReportsOutstanding);
reportsRouter.get("/claims", reportsController.getReportsClaims);
reportsRouter.get("/salesmen", reportsController.getReportsSalesmen);
reportsRouter.get("/alerts", reportsController.getReportsAlerts);
reportsRouter.get("/coldchain", reportsController.getReportsColdChain);
reportsRouter.get("/h1", reportsController.getReportsH1);
reportsRouter.get("/near-expiry", reportsController.getReportsNearExpiry);
reportsRouter.get("/export/:reportType", reportsController.exportReport);
