import { Router } from "express";
import { MakeCreateScientificStudyRoute } from "./createScientificStudy.controller";
// import { MakeCreateScientificStudyFromURLRoute } from "./createScientificStudyFromUrl.controller";
import { MakeDeleteScientificStudyRoute } from "./deleteScientificStudy.controller";
import { MakeEditScientificStudyRoute } from "./editScientificStudy.controller";
import { RouteContext } from "@routes/route.types";
import { MakeExtractScientificStudyFromURLRoute } from './extractScientificStudyFromUrl.controller';
import { MakeGetScientificStudyRoute } from "./getScientificStudy.controller";
import { MakeListScientificStudyRoute } from "./listScientificStudy.controller";

export const MakeScientificStudyRoutes = (
  router: Router,
  ctx: RouteContext
): void => {
  MakeExtractScientificStudyFromURLRoute(router, ctx);
  // MakeCreateScientificStudyFromURLRoute(router, ctx);
  MakeCreateScientificStudyRoute(router, ctx);
  MakeEditScientificStudyRoute(router, ctx);
  MakeListScientificStudyRoute(router, ctx);
  MakeGetScientificStudyRoute(router, ctx);
  MakeDeleteScientificStudyRoute(router, ctx);
};
