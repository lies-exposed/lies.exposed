import { type Router } from "express";
import { MakeGetStatsRoute } from "./getStats.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeStatsRoutes = (router: Router, ctx: RouteContext): void => {
  MakeGetStatsRoute(router, ctx);
};
