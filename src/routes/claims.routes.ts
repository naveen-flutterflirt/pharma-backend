import { Router } from "express";
import * as claimsController from "../controllers/claims.controller";

export const claimsRouter = Router();

claimsRouter.get("/stats", claimsController.getClaimsStats);
claimsRouter.get("/export/csv", claimsController.exportClaimsCsv);
claimsRouter.get("/", claimsController.getClaims);
claimsRouter.get("/:id", claimsController.getClaimById);
claimsRouter.post("/", claimsController.createClaim);
claimsRouter.patch("/:id/status", claimsController.updateClaimStatus);
claimsRouter.post("/:id/settle", claimsController.settleClaim);
claimsRouter.delete("/:id", claimsController.deleteClaim);
