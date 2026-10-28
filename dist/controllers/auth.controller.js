"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.logout = exports.getMe = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../db/prisma");
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const login = async (req, res) => {
    try {
        const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
        const { email, password } = req.body;
        // 1. Validation Firstly
        const validationErrors = {};
        if (!email || typeof email !== "string" || !email.trim()) {
            validationErrors.email = "Email address is required.";
        }
        else if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
            validationErrors.email = "Please enter a valid email address (e.g., staff@pharma.com).";
        }
        if (!password || typeof password !== "string") {
            validationErrors.password = "Password is required.";
        }
        else if (password.length < 6) {
            validationErrors.password = "Password must be at least 6 characters long.";
        }
        else if (password.length > 128) {
            validationErrors.password = "Password must not exceed 128 characters.";
        }
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                error: "Validation failed. Please correct the highlighted errors.",
                code: "VALIDATION_ERROR",
                errors: validationErrors
            });
        }
        const cleanEmail = email.trim().toLowerCase();
        const rateLimitKey = `${clientIp}_${cleanEmail}`;
        const now = Date.now();
        // 2. Check Rate Limiting
        const attemptRecord = loginAttempts.get(rateLimitKey);
        if (attemptRecord && attemptRecord.blockedUntil > now) {
            const remainingMinutes = Math.ceil((attemptRecord.blockedUntil - now) / (60 * 1000));
            return res.status(429).json({
                error: `Too many failed login attempts. For security, access is temporarily locked. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}.`,
                code: "TOO_MANY_REQUESTS",
                retryAfterMinutes: remainingMinutes
            });
        }
        // 3. Query User in Database
        const user = await prisma_1.prisma.user.findFirst({
            where: { email: cleanEmail }
        });
        if (!user) {
            const current = loginAttempts.get(rateLimitKey) || { attempts: 0, blockedUntil: 0 };
            current.attempts += 1;
            if (current.attempts >= MAX_ATTEMPTS) {
                current.blockedUntil = now + LOCKOUT_DURATION_MS;
            }
            loginAttempts.set(rateLimitKey, current);
            await prisma_1.prisma.auditLog.create({
                data: {
                    timestamp: new Date().toLocaleTimeString(),
                    user: `Unknown (${cleanEmail})`,
                    action: `Failed login attempt (unrecognized account) from IP ${clientIp}`,
                    module: "Security & Authentication",
                    severity: "warning",
                    ipAddress: clientIp
                }
            });
            return res.status(401).json({
                error: "Invalid email or password. Please verify your credentials.",
                code: "INVALID_CREDENTIALS"
            });
        }
        // 4. Check Active Status
        if (!user.isActive) {
            return res.status(403).json({
                error: "This staff account has been deactivated. Please contact your system administrator.",
                code: "ACCOUNT_INACTIVE"
            });
        }
        // 5. Verify Password
        let isPasswordValid = false;
        if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
            isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        }
        else {
            isPasswordValid = user.password === password;
            if (isPasswordValid) {
                const salt = await bcryptjs_1.default.genSalt(10);
                const hashedPassword = await bcryptjs_1.default.hash(password, salt);
                await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: { password: hashedPassword }
                });
            }
        }
        if (!isPasswordValid) {
            const current = loginAttempts.get(rateLimitKey) || { attempts: 0, blockedUntil: 0 };
            current.attempts += 1;
            if (current.attempts >= MAX_ATTEMPTS) {
                current.blockedUntil = now + LOCKOUT_DURATION_MS;
            }
            loginAttempts.set(rateLimitKey, current);
            await prisma_1.prisma.auditLog.create({
                data: {
                    timestamp: new Date().toLocaleTimeString(),
                    user: `${user.name} (${user.role})`,
                    action: `Failed login attempt (invalid password) from IP ${clientIp}. Attempt ${current.attempts}/${MAX_ATTEMPTS}`,
                    module: "Security & Authentication",
                    severity: "warning",
                    ipAddress: clientIp
                }
            });
            return res.status(401).json({
                error: "Invalid email or password. Please verify your credentials.",
                code: "INVALID_CREDENTIALS",
                remainingAttempts: Math.max(0, MAX_ATTEMPTS - current.attempts)
            });
        }
        // 6. Success -> Reset Rate Limit Counter
        loginAttempts.delete(rateLimitKey);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                timestamp: new Date().toLocaleTimeString(),
                user: `${user.name} (${user.role})`,
                action: `Staff logged into DMS session from IP ${clientIp}`,
                module: "Security & Authentication",
                severity: "info",
                ipAddress: clientIp
            }
        });
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            branch: user.branch,
            makerChecker: user.makerChecker
        };
        const token = jsonwebtoken_1.default.sign(payload, env_1.config.JWT_SECRET, { expiresIn: env_1.config.JWT_EXPIRES_IN });
        return res.json({
            success: true,
            message: "Authentication successful",
            token,
            user: payload
        });
    }
    catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Internal server error during login" });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: "Session not found" });
        }
        let user = await prisma_1.prisma.user.findFirst({
            where: req.user.id === "demo-admin-id" ? { role: client_1.UserRole.OWNER } : { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                branch: true,
                phone: true,
                isActive: true,
                makerChecker: true,
                lastLogin: true,
                createdAt: true
            }
        });
        if (!user && req.user.id === "demo-admin-id") {
            user = {
                id: "demo-admin-id",
                name: "Mr. Rajesh Shah (Director)",
                email: "admin@pharmadms.com",
                role: client_1.UserRole.OWNER,
                branch: "Main Central Depot",
                phone: "+91 98200 12345",
                isActive: true,
                makerChecker: true,
                lastLogin: new Date(),
                createdAt: new Date()
            };
        }
        if (!user) {
            return res.status(404).json({ error: "User record not found" });
        }
        return res.json({ success: true, user });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getMe = getMe;
const logout = async (req, res) => {
    try {
        if (req.user) {
            await prisma_1.prisma.auditLog.create({
                data: {
                    timestamp: new Date().toLocaleTimeString(),
                    user: `${req.user.name} (${req.user.role})`,
                    action: "User logged out of session",
                    module: "Security & Authentication",
                    severity: "info"
                }
            });
        }
        return res.json({ success: true, message: "Logged out successfully" });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.logout = logout;
const getUsers = async (_req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                branch: true,
                isActive: true,
                makerChecker: true,
                lastLogin: true
            },
            orderBy: { role: "asc" }
        });
        return res.json({ users });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getUsers = getUsers;
