import { Router } from "express";
import * as deliveryController from "../controllers/delivery.controller";

export const deliveryRouter = Router();

// Metrics & Manifest Export
deliveryRouter.get("/stats", deliveryController.getDeliveryStats);
deliveryRouter.get("/export/csv", deliveryController.exportDeliveryManifestCsv);

// Route Operations
deliveryRouter.post("/routes/:id/settle", deliveryController.settleRouteDayEnd);
deliveryRouter.get("/routes/:id", deliveryController.getDeliveryRouteById);
deliveryRouter.get("/routes", deliveryController.listDeliveryRoutes);
deliveryRouter.post("/routes", deliveryController.createDeliveryRoute);

// Drop Operations
deliveryRouter.post("/drops/:id/verify-otp", deliveryController.verifyDropOtp);
deliveryRouter.post("/drops/:id/collect", deliveryController.recordDropCollection);
deliveryRouter.patch("/drops/:id/status", deliveryController.updateDropStatus);

// Root routes alias
deliveryRouter.get("/", deliveryController.listDeliveryRoutes);
