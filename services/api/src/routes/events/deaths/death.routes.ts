import { type Router } from "express";
import { MakeCreateDeathEventRoute } from "./createDeath.controller";
import { MakeDeleteDeathEventRoute } from "./deleteDeath.controller";
import { MakeEditDeathEventRoute } from "./editDeath.controller";
import { MakeGetDeathEventRoute } from "./getDeath.controller";
import { MakeGetListDeathEventRoute } from "./getListDeath.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeDeathEventsRoutes = (
  router: Router,
  ctx: RouteContext,
): void => {
  MakeCreateDeathEventRoute(router, ctx);
  MakeEditDeathEventRoute(router, ctx);
  MakeGetDeathEventRoute(router, ctx);
  MakeGetListDeathEventRoute(router, ctx);
  MakeDeleteDeathEventRoute(router, ctx);
};
