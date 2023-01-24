import { type Router } from "express";
import { MakeCreateAreaRoute } from "./createArea.controller";
import { MakeDeleteAreaRoute } from "./deleteArea.controller";
import { MakeEditAreaRoute } from "./editArea.controller";
import { MakeGetAreaRoute } from "./getArea.controller";
import { MakeListAreaRoute } from "./listArea.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeAreasRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateAreaRoute(router, ctx);
  MakeEditAreaRoute(router, ctx);
  MakeGetAreaRoute(router, ctx);
  MakeListAreaRoute(router, ctx);
  MakeDeleteAreaRoute(router, ctx);
};
