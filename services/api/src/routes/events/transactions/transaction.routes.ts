import { type Router } from "express";
import { MakeCreateTransactionEventRoute } from "./createTransaction.controller.js";
import { MakeEditTransactionEventRoute } from "./editTransaction.controller.js";
import { MakeGetListTransactionEventRoute } from "./getListTransaction.controller.js";
import { MakeGetTransactionEventRoute } from "./getTransaction.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeTransactionEventsRoutes = (
  router: Router,
  ctx: ServerContext,
): void => {
  MakeGetTransactionEventRoute(router, ctx);
  MakeGetListTransactionEventRoute(router, ctx);
  MakeCreateTransactionEventRoute(router, ctx);
  MakeEditTransactionEventRoute(router, ctx);
};
