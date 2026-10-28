import { Router } from "express";
import * as salesmenController from "../controllers/salesmen.controller";

export const salesmenRouter = Router();

salesmenRouter.get("/", salesmenController.getSalesmen);
salesmenRouter.get("/export/scorecard", salesmenController.exportSalesmenScorecard);
salesmenRouter.get("/:id", salesmenController.getSalesmanById);
salesmenRouter.post("/", salesmenController.createSalesman);
salesmenRouter.put("/:id", salesmenController.updateSalesman);
salesmenRouter.delete("/:id", salesmenController.deleteSalesman);
salesmenRouter.post("/:id/broadcast", salesmenController.broadcastBeat);
salesmenRouter.post("/visits/:id/check-in", salesmenController.checkInBeatVisit);
salesmenRouter.post("/visits/:id/book-order", salesmenController.bookBeatOrder);
salesmenRouter.post("/visits/:id/skip", salesmenController.skipBeatVisit);
salesmenRouter.post("/:id/add-stop", salesmenController.addBeatStop);
