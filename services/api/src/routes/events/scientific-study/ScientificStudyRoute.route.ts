import { Router } from "express";
import { MakeCreateScientificStudyRoute } from "./createScientificStudy.controller";
import { MakeEditScientificStudyRoute } from "./editScientificStudy.controller";
import { MakeGetScientificStudyRoute } from "./getScientificStudy.controller";
import { MakeListScientificStudyRoute } from "./listScientificStudy.controller";
import { RouteContext } from "@routes/route.types";
import { MakeDeleteScientificStudyRoute } from "./deleteScientificStudy.controller";

export const MakeScientificStudyRoutes = (
  router: Router,
  ctx: RouteContext
): void => {
  MakeCreateScientificStudyRoute(router, ctx);
  MakeEditScientificStudyRoute(router, ctx);
  MakeListScientificStudyRoute(router, ctx);
  MakeGetScientificStudyRoute(router, ctx);
  MakeDeleteScientificStudyRoute(router, ctx);
};
