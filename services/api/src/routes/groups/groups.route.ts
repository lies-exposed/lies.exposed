import { type Router } from "express";
import { MakeCreateGroupRoute } from "./createGroup.controller";
import { MakeDeleteGroupRoute } from "./deleteGroup.controller";
import { MakeEditGroupRoute } from "./editGroup.controller";
import { MakeGetGroupRoute } from "./getGroup.controller";
import { MakeListGroupRoute } from "./getGroups.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeGroupRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateGroupRoute(router, ctx);
  MakeEditGroupRoute(router, ctx);
  MakeGetGroupRoute(router, ctx);
  MakeListGroupRoute(router, ctx);
  MakeDeleteGroupRoute(router, ctx);
};
