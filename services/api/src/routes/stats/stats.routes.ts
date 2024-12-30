import { type Router } from "express";
import { MakeGetStatsRoute } from "./getStats.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeStatsRoutes = (router: Router, ctx: ServerContext): void => {
  MakeGetStatsRoute(router, ctx);
};
