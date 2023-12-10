import { type Router } from "express";
import { MakeCreateAreaRoute } from "./createArea.controller.js";
import { MakeDeleteAreaRoute } from "./deleteArea.controller.js";
import { MakeEditAreaRoute } from "./editArea.controller.js";
import { MakeGetAreaRoute } from "./getArea.controller.js";
import { MakeListAreaRoute } from "./listArea.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeAreasRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateAreaRoute(router, ctx);
  MakeEditAreaRoute(router, ctx);
  MakeGetAreaRoute(router, ctx);
  MakeListAreaRoute(router, ctx);
  MakeDeleteAreaRoute(router, ctx);
};
