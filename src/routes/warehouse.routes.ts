import { Router } from "express";
import * as warehouseController from "../controllers/warehouse.controller";

export const warehouseRouter = Router();

warehouseRouter.get("/stats", warehouseController.getWarehouseStats);
warehouseRouter.get("/export/csv", warehouseController.exportWarehouseManifestCsv);
warehouseRouter.get("/waves", warehouseController.listPickWaves);
warehouseRouter.post("/waves", warehouseController.createPickWave);
warehouseRouter.get("/waves/:id", warehouseController.getPickWaveById);
warehouseRouter.patch("/waves/:id/status", warehouseController.updateWaveStatus);
warehouseRouter.post("/waves/:id/seal", warehouseController.sealWaveTote);
warehouseRouter.post("/waves/:id/dispatch", warehouseController.dispatchWaveToVan);
warehouseRouter.post("/scan", warehouseController.scanBarcode);
