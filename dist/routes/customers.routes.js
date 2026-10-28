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
exports.customersRouter = void 0;
const express_1 = require("express");
const customersController = __importStar(require("../controllers/customers.controller"));
exports.customersRouter = (0, express_1.Router)();
// Aggregate KPIs and stats
exports.customersRouter.get("/stats", customersController.getCustomerStats);
// Directory CSV export
exports.customersRouter.get("/export/csv", customersController.exportCustomersCsv);
// Single customer operations
exports.customersRouter.get("/:id/ledger", customersController.getCustomerLedger);
exports.customersRouter.post("/:id/reminder", customersController.sendPaymentReminder);
exports.customersRouter.patch("/:id/status", customersController.toggleCustomerStatus);
exports.customersRouter.get("/:id", customersController.getCustomerById);
exports.customersRouter.put("/:id", customersController.updateCustomer);
exports.customersRouter.patch("/:id", customersController.updateCustomer);
// Root collection operations
exports.customersRouter.get("/", customersController.listCustomers);
exports.customersRouter.post("/", customersController.createCustomer);
