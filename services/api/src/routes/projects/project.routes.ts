import { type Router } from "express";
import { MakeCreateProjectRoute } from "./createProject.controller.js";
import { MakeEditProjectRoute } from "./editProject.controller.js";
import { MakeGetProjectRoute } from "./getProject.controller.js";
import { MakeListProjectRoute } from "./getProjects.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeProjectRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateProjectRoute(router, ctx);
  MakeEditProjectRoute(router, ctx);
  MakeGetProjectRoute(router, ctx);
  MakeListProjectRoute(router, ctx);
};
