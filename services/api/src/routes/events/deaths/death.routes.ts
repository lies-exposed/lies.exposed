import { type Router } from "express";
import { MakeCreateDeathEventRoute } from "./createDeath.controller.js";
import { MakeDeleteDeathEventRoute } from "./deleteDeath.controller.js";
import { MakeEditDeathEventRoute } from "./editDeath.controller.js";
import { MakeGetDeathEventRoute } from "./getDeath.controller.js";
import { MakeGetListDeathEventRoute } from "./getListDeath.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeDeathEventsRoutes = (
  router: Router,
  ctx: ServerContext,
): void => {
  MakeCreateDeathEventRoute(router, ctx);
  MakeEditDeathEventRoute(router, ctx);
  MakeGetDeathEventRoute(router, ctx);
  MakeGetListDeathEventRoute(router, ctx);
  MakeDeleteDeathEventRoute(router, ctx);
};
