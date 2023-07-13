import { type Router } from "express";
import { MakeGetNetworkRoute } from "./getNetwork.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeNetworksRoutes = (router: Router, ctx: RouteContext): void => {
  MakeGetNetworkRoute(router, ctx);
};
