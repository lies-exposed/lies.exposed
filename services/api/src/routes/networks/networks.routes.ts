import { type Router } from "express";
import { MakeEditNetworkRoute } from "./editNetwork.controller.js";
import { MakeGetNetworkRoute } from "./getNetwork.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeNetworksRoutes = (router: Router, ctx: RouteContext): void => {
  MakeGetNetworkRoute(router, ctx);
  MakeEditNetworkRoute(router, ctx);
};
