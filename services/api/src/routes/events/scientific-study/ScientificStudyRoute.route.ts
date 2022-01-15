import { Router } from "express";
import { MakeCreateScientificStudyRoute } from "./createScientificStudy.controller";
import { MakeCreateScientificStudyFromURLRoute } from "./createScientificStudyFromUrl.controller";
import { MakeDeleteScientificStudyRoute } from "./deleteScientificStudy.controller";
import { MakeEditScientificStudyRoute } from "./editScientificStudy.controller";
import { MakeGetScientificStudyRoute } from "./getScientificStudy.controller";
import { MakeListScientificStudyRoute } from "./listScientificStudy.controller";
import { RouteContext } from "@routes/route.types";

export const MakeScientificStudyRoutes = (
  router: Router,
  ctx: RouteContext
): void => {
  MakeCreateScientificStudyFromURLRoute(router, ctx);
  MakeCreateScientificStudyRoute(router, ctx);
  MakeEditScientificStudyRoute(router, ctx);
  MakeListScientificStudyRoute(router, ctx);
  MakeGetScientificStudyRoute(router, ctx);
  MakeDeleteScientificStudyRoute(router, ctx);
};
