import { Router } from "express";
import * as ordersController from "../controllers/orders.controller";

export const ordersRouter = Router();

// KPI Stats & CSV Export (Specific endpoints first)
ordersRouter.get("/stats", ordersController.getOrderStats);
ordersRouter.get("/export/csv", ordersController.exportOrdersCsv);

// Order List & Creation
ordersRouter.get("/", ordersController.listOrders);
ordersRouter.post("/", ordersController.createOrder);
ordersRouter.get("/:id", ordersController.getOrderById);

// Order Actions
ordersRouter.post("/:id/hold", ordersController.toggleHoldOrder);
ordersRouter.post("/:id/override", ordersController.overrideCreditLock);
ordersRouter.post("/:id/bill", ordersController.billOrder);
