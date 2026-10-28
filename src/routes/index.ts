import { Router } from "express";
import { authRouter } from "./auth.routes";
import { ordersRouter } from "./orders.routes";
import { invoicesRouter } from "./invoices.routes";
import { productsRouter } from "./products.routes";
import { warehouseRouter } from "./warehouse.routes";
import { deliveryRouter } from "./delivery.routes";
import { collectionsRouter } from "./collections.routes";
import { customersRouter } from "./customers.routes";
import { purchaseRouter } from "./purchase.routes";
import { claimsRouter } from "./claims.routes";
import { salesmenRouter } from "./salesmen.routes";
import { reportsRouter } from "./reports.routes";
import { settingsRouter } from "./settings.routes";
import { dashboardRouter } from "./dashboard.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/invoices", invoicesRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/warehouse", warehouseRouter);
apiRouter.use("/delivery", deliveryRouter);
apiRouter.use("/collections", collectionsRouter);
apiRouter.use("/customers", customersRouter);
apiRouter.use("/purchase", purchaseRouter);
apiRouter.use("/claims", claimsRouter);
apiRouter.use("/salesmen", salesmenRouter);
apiRouter.use("/reports", reportsRouter);
apiRouter.use("/settings", settingsRouter);

export {
  authRouter,
  dashboardRouter,
  ordersRouter,
  invoicesRouter,
  productsRouter,
  warehouseRouter,
  deliveryRouter,
  collectionsRouter,
  customersRouter,
  purchaseRouter,
  claimsRouter,
  salesmenRouter,
  reportsRouter,
  settingsRouter
};
