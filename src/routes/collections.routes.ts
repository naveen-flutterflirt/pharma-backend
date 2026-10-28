import { Router } from "express";
import * as collectionsController from "../controllers/collections.controller";

export const collectionsRouter = Router();

collectionsRouter.get("/stats", collectionsController.getCollectionStats);
collectionsRouter.get("/export/csv", collectionsController.exportCollectionsCsv);
collectionsRouter.post("/auto-match", collectionsController.autoMatchBankFeeds);
collectionsRouter.patch("/:id/reconcile", collectionsController.reconcileCollection);
collectionsRouter.get("/", collectionsController.listCollections);
collectionsRouter.post("/", collectionsController.createCollection);
