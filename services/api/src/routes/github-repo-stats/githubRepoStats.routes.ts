import { type Router } from "express";
import { MakeListGithubRepoStatsRoute } from "./listGithubRepoStats.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeGithubRepoStatsRoutes = (
  router: Router,
  ctx: ServerContext,
): void => {
  MakeListGithubRepoStatsRoute(router, ctx);
};
