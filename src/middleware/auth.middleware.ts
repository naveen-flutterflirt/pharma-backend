import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  branch: string;
  makerChecker: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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

  jwt.verify(token, secret, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({
        error: "Invalid or expired session token. Please log in again.",
        code: "FORBIDDEN"
      });
    }

    req.user = decoded as AuthenticatedUser;
    next();
  });
};
