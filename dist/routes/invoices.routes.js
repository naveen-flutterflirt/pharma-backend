"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoicesRouter = void 0;
const express_1 = require("express");
const invoicesController = __importStar(require("../controllers/invoices.controller"));
exports.invoicesRouter = (0, express_1.Router)();
// KPI Stats & GSTR-1 CSV Export (Specific endpoints first)
exports.invoicesRouter.get("/stats", invoicesController.getBillingStats);
exports.invoicesRouter.get("/export/csv", invoicesController.exportGstr1Csv);
// Collection & CRUD
exports.invoicesRouter.get("/", invoicesController.listInvoices);
exports.invoicesRouter.post("/", invoicesController.createInvoice);
exports.invoicesRouter.get("/:id", invoicesController.getInvoiceById);
// Statutory & Operational Actions
exports.invoicesRouter.post("/:id/irn", invoicesController.generateIrn);
exports.invoicesRouter.post("/:id/eway", invoicesController.generateEwayBill);
exports.invoicesRouter.post("/:id/dispatch", invoicesController.updateDispatchStatus);
exports.invoicesRouter.post("/:id/payment", invoicesController.recordPayment);
