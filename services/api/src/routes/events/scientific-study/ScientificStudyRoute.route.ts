import { type Router } from "express";
import { MakeCreateScientificStudyRoute } from "./createScientificStudy.controller.js";
// import { MakeCreateScientificStudyFromURLRoute } from "./createScientificStudyFromUrl.controller.js";
import { MakeDeleteScientificStudyRoute } from "./deleteScientificStudy.controller.js";
import { MakeEditScientificStudyRoute } from "./editScientificStudy.controller.js";
import { MakeExtractScientificStudyFromURLRoute } from "./extractScientificStudyFromUrl.controller.js";
import { MakeGetScientificStudyRoute } from "./getScientificStudy.controller.js";
import { MakeListScientificStudyRoute } from "./listScientificStudy.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeScientificStudyRoutes = (
  router: Router,
  ctx: RouteContext,
): void => {
  MakeExtractScientificStudyFromURLRoute(router, ctx);
  // MakeCreateScientificStudyFromURLRoute(router, ctx);
  MakeCreateScientificStudyRoute(router, ctx);
  MakeEditScientificStudyRoute(router, ctx);
  MakeListScientificStudyRoute(router, ctx);
  MakeGetScientificStudyRoute(router, ctx);
  MakeDeleteScientificStudyRoute(router, ctx);
};
