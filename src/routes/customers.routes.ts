import { Router } from "express";
import * as customersController from "../controllers/customers.controller";

export const customersRouter = Router();

// Aggregate KPIs and stats
customersRouter.get("/stats", customersController.getCustomerStats);

// Directory CSV export
customersRouter.get("/export/csv", customersController.exportCustomersCsv);

// Single customer operations
customersRouter.get("/:id/ledger", customersController.getCustomerLedger);
customersRouter.post("/:id/reminder", customersController.sendPaymentReminder);
customersRouter.patch("/:id/status", customersController.toggleCustomerStatus);
customersRouter.get("/:id", customersController.getCustomerById);
customersRouter.put("/:id", customersController.updateCustomer);
customersRouter.patch("/:id", customersController.updateCustomer);

// Root collection operations
customersRouter.get("/", customersController.listCustomers);
customersRouter.post("/", customersController.createCustomer);
