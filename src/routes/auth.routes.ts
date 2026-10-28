import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

export const authRouter = Router();

authRouter.post("/login", authController.login);
authRouter.get("/me", authenticateToken, authController.getMe);
authRouter.post("/logout", authenticateToken, authController.logout);
authRouter.get("/users", authController.getUsers);
