import { Router } from "express";
import { MakeCreateProjectRoute } from "./createProject.controller";
import { MakeEditProjectRoute } from "./editProject.controller";
import { MakeGetProjectRoute } from "./getProject.controller";
import { RouteContext } from "@routes/route.types";
import { MakeListProjectRoute } from "./getProjects.controller";

export const MakeProjectRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateProjectRoute(router, ctx);
  MakeEditProjectRoute(router, ctx);
  MakeGetProjectRoute(router, ctx);
  MakeListProjectRoute(router, ctx);
};
