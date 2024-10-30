import { postRouter } from "@/server/api/routers/admin/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { productRouter } from "./routers/admin/product";
import { categoryRouter } from "./routers/admin/category";
import { settingsRouter } from "./routers/admin/settings";
import { cashierRouter } from "./routers/admin/cashier";
import { riderRouter } from "./routers/admin/rider";
import { transactionRouter } from "./routers/admin/transaction";
import { dashboardRouter } from "./routers/admin/dashboard";
import { cashierOrderRouter } from "./routers/cashier/orders";
import { cashierTransactionRouter } from "./routers/cashier/transaction";
import { cashierAccountRouter } from "./routers/cashier/account";
import { globalRouter } from "./routers/global";
import { customerOrderRouter } from "./routers/customer/orders";
import { customerSettingsRouter } from "./routers/customer/settings";
import { customerTransactionRouter } from "./routers/customer/transaction";
import { customerAccountRouter } from "./routers/customer/account";
import { riderAccountRouter } from "./routers/rider/account";
import { riderDeliveryRouter } from "./routers/rider/delivery";
import { riderTransactionRouter } from "./routers/rider/transaction";
import { salesRouter } from "./routers/admin/sales";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  product : productRouter,
  category : categoryRouter,
  settings : settingsRouter,
  cashier : cashierRouter,
  rider : riderRouter,
  transaction  : transactionRouter,
  dashboard : dashboardRouter,
  sales : salesRouter,
  user_cashier : {
    order : cashierOrderRouter,
    transaction : cashierTransactionRouter,
    account : cashierAccountRouter
  },
  user_customer : {
    order : customerOrderRouter,
    settings : customerSettingsRouter,
    transaction :customerTransactionRouter,
    account : customerAccountRouter
  },
  user_rider : {
    account : riderAccountRouter,
    delivery : riderDeliveryRouter,
    transaction :riderTransactionRouter,
  },
  global : globalRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
