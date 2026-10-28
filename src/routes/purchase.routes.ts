import { Router } from "express";
import * as purchaseController from "../controllers/purchase.controller";

export const purchaseRouter = Router();

// Stats & Export (must precede parameterized routes)
purchaseRouter.get("/stats", purchaseController.getPurchaseStats);
purchaseRouter.get("/export/csv", purchaseController.exportPurchaseManifestCsv);

// Purchase Orders CRUD
purchaseRouter.get("/orders", purchaseController.listPurchaseOrders);
purchaseRouter.post("/orders", purchaseController.createPurchaseOrder);
purchaseRouter.get("/orders/:id", purchaseController.getPurchaseOrderById);
purchaseRouter.get("/orders/:id/debit-note", purchaseController.getDebitNote);
purchaseRouter.post("/orders/:id/grn", purchaseController.processGrn);
