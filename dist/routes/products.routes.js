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
exports.productsRouter = void 0;
const express_1 = require("express");
const productsController = __importStar(require("../controllers/products.controller"));
exports.productsRouter = (0, express_1.Router)();
// Stats & Export (must precede parameterized routes)
exports.productsRouter.get("/stats", productsController.getProductStats);
exports.productsRouter.get("/principals", productsController.getDistinctPrincipals);
exports.productsRouter.get("/export/csv", productsController.exportProductsCsv);
// Product CRUD & Batches
exports.productsRouter.get("/", productsController.listProducts);
exports.productsRouter.post("/", productsController.createProduct);
exports.productsRouter.get("/:id", productsController.getProductById);
exports.productsRouter.patch("/:id", productsController.updateProduct);
exports.productsRouter.delete("/:id", productsController.deleteProduct);
// Batch & Stock Adjustments
exports.productsRouter.post("/:id/batches", productsController.addProductBatch);
exports.productsRouter.post("/:id/adjust-stock", productsController.adjustStock);
