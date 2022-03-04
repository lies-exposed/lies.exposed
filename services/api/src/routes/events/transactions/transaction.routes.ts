import { Router } from "express";
import { MakeCreateTransactionEventRoute } from "./createTransaction.controller";
import { MakeEditTransactionEventRoute } from "./editTransaction.controller";
import { MakeGetListTransactionEventRoute } from "./getListTransaction.controller";
import { MakeGetTransactionEventRoute } from "./getTransaction.controller";
import { RouteContext } from "@routes/route.types";

export const MakeTransactionEventsRoutes = (
  router: Router,
  ctx: RouteContext
): void => {
  MakeGetTransactionEventRoute(router, ctx);
  MakeGetListTransactionEventRoute(router, ctx);
  MakeCreateTransactionEventRoute(router, ctx);
  MakeEditTransactionEventRoute(router, ctx);
};
