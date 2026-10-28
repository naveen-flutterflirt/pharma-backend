import { Router } from "express";
import * as invoicesController from "../controllers/invoices.controller";

export const invoicesRouter = Router();

// KPI Stats & GSTR-1 CSV Export (Specific endpoints first)
invoicesRouter.get("/stats", invoicesController.getBillingStats);
invoicesRouter.get("/export/csv", invoicesController.exportGstr1Csv);

// Collection & CRUD
invoicesRouter.get("/", invoicesController.listInvoices);
invoicesRouter.post("/", invoicesController.createInvoice);
invoicesRouter.get("/:id", invoicesController.getInvoiceById);

// Statutory & Operational Actions
invoicesRouter.post("/:id/irn", invoicesController.generateIrn);
invoicesRouter.post("/:id/eway", invoicesController.generateEwayBill);
invoicesRouter.post("/:id/dispatch", invoicesController.updateDispatchStatus);
invoicesRouter.post("/:id/payment", invoicesController.recordPayment);
