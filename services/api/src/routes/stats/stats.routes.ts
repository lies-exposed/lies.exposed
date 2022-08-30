import { Router } from "express";
import { MakeGetStatsRoute } from './getStats.controller';
import { RouteContext } from "@routes/route.types";

export const MakeStatsRoutes = (router: Router, ctx: RouteContext): void => {
  MakeGetStatsRoute(router, ctx);
  
};
