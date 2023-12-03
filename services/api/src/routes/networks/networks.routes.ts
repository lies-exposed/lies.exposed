import { type Router } from "express";
import { MakeEditNetworkRoute } from "./editNetwork.controller";
import { MakeGetNetworkRoute } from "./getNetwork.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeNetworksRoutes = (router: Router, ctx: RouteContext): void => {
  MakeGetNetworkRoute(router, ctx);
  MakeEditNetworkRoute(router, ctx);
};
