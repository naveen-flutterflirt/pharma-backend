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
exports.deliveryRouter = void 0;
const express_1 = require("express");
const deliveryController = __importStar(require("../controllers/delivery.controller"));
exports.deliveryRouter = (0, express_1.Router)();
// Metrics & Manifest Export
exports.deliveryRouter.get("/stats", deliveryController.getDeliveryStats);
exports.deliveryRouter.get("/export/csv", deliveryController.exportDeliveryManifestCsv);
// Route Operations
exports.deliveryRouter.post("/routes/:id/settle", deliveryController.settleRouteDayEnd);
exports.deliveryRouter.get("/routes/:id", deliveryController.getDeliveryRouteById);
exports.deliveryRouter.get("/routes", deliveryController.listDeliveryRoutes);
exports.deliveryRouter.post("/routes", deliveryController.createDeliveryRoute);
// Drop Operations
exports.deliveryRouter.post("/drops/:id/verify-otp", deliveryController.verifyDropOtp);
exports.deliveryRouter.post("/drops/:id/collect", deliveryController.recordDropCollection);
exports.deliveryRouter.patch("/drops/:id/status", deliveryController.updateDropStatus);
// Root routes alias
exports.deliveryRouter.get("/", deliveryController.listDeliveryRoutes);
