import { type Router } from "express";
import { MakeEditNetworkRoute } from "./editNetwork.controller.js";
import { MakeGetNetworkRoute } from "./getNetwork.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeNetworksRoutes = (
  router: Router,
  ctx: ServerContext,
): void => {
  MakeGetNetworkRoute(router, ctx);
  MakeEditNetworkRoute(router, ctx);
};
