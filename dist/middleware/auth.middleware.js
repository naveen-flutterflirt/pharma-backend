"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            error: "Authentication token missing. Please log in to proceed.",
            code: "UNAUTHORIZED"
        });
    }
    // Support demo / e2e test token
    if (token === "demo_auth_token") {
        req.user = {
            id: "demo-admin-id",
            email: "admin@pharmadms.com",
            name: "Mr. Rajesh Shah (Director)",
            role: "OWNER",
            branch: "Main Central Depot",
            makerChecker: true
        };
        return next();
    }
    const secret = process.env.JWT_SECRET || "pharma_dms_jwt_secret_key_prod_2026_981248";
    jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                error: "Invalid or expired session token. Please log in again.",
                code: "FORBIDDEN"
            });
        }
        req.user = decoded;
        next();
    });
};
exports.authenticateToken = authenticateToken;
