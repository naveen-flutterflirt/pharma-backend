import { Router } from "express";
import * as productsController from "../controllers/products.controller";

export const productsRouter = Router();

// Stats & Export (must precede parameterized routes)
productsRouter.get("/stats", productsController.getProductStats);
productsRouter.get("/principals", productsController.getDistinctPrincipals);
productsRouter.get("/export/csv", productsController.exportProductsCsv);

// Product CRUD & Batches
productsRouter.get("/", productsController.listProducts);
productsRouter.post("/", productsController.createProduct);
productsRouter.get("/:id", productsController.getProductById);
productsRouter.patch("/:id", productsController.updateProduct);
productsRouter.delete("/:id", productsController.deleteProduct);

// Batch & Stock Adjustments
productsRouter.post("/:id/batches", productsController.addProductBatch);
productsRouter.post("/:id/adjust-stock", productsController.adjustStock);
