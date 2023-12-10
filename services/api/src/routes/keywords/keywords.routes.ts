import { type Router } from "express";
import { MakeCreateKeywordRoute } from "./createKeyword.controller.js";
import { MakeDeleteKeywordRoute } from "./deleteKeyword.controller.js";
import { MakeEditKeywordsRoute } from "./editKeyword.controller.js";
import { MakeGetKeywordRoute } from "./getKeyword.controller.js";
import { MakeKeywordsDistributionRoute } from "./keywordsDistribution.controller.js";
import { MakeListKeywordRoute } from "./listKeyword.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeKeywordRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateKeywordRoute(router, ctx);
  MakeEditKeywordsRoute(router, ctx);
  MakeKeywordsDistributionRoute(router, ctx);
  MakeGetKeywordRoute(router, ctx);
  MakeListKeywordRoute(router, ctx);
  MakeDeleteKeywordRoute(router, ctx);
};
