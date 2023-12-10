import { type Router } from "express";
import { MakeCreateGroupRoute } from "./createGroup.controller.js";
import { MakeDeleteGroupRoute } from "./deleteGroup.controller.js";
import { MakeEditGroupRoute } from "./editGroup.controller.js";
import { MakeGetGroupRoute } from "./getGroup.controller.js";
import { MakeListGroupRoute } from "./getGroups.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeGroupRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateGroupRoute(router, ctx);
  MakeEditGroupRoute(router, ctx);
  MakeGetGroupRoute(router, ctx);
  MakeListGroupRoute(router, ctx);
  MakeDeleteGroupRoute(router, ctx);
};
