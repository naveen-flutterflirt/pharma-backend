"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    PORT: process.env.PORT || 5001,
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL || "",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    JWT_SECRET: process.env.JWT_SECRET || "pharma_dms_jwt_secret_key_prod_2026_981248",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    ALLOWED_ORIGINS: [
        "http://localhost:3000",
        "http://localhost:3001",
        process.env.FRONTEND_URL
    ].filter(Boolean)
};
