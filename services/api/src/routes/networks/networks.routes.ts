import { Router } from "express";
import { MakeGetNetworkRoute } from './getNetwork.route';
import { RouteContext } from "@routes/route.types";

export const MakeNetworksRoutes = (router: Router, ctx: RouteContext): void => {
  MakeGetNetworkRoute(router, ctx);
};
