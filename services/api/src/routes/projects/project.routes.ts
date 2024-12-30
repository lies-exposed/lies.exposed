import { type Router } from "express";
import { MakeCreateProjectRoute } from "./createProject.controller.js";
import { MakeEditProjectRoute } from "./editProject.controller.js";
import { MakeGetProjectRoute } from "./getProject.controller.js";
import { MakeListProjectRoute } from "./getProjects.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeProjectRoutes = (router: Router, ctx: ServerContext): void => {
  MakeCreateProjectRoute(router, ctx);
  MakeEditProjectRoute(router, ctx);
  MakeGetProjectRoute(router, ctx);
  MakeListProjectRoute(router, ctx);
};
