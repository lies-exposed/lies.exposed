import { Router } from "express";
import { MakeCreateKeywordRoute } from "./createKeyword.controller";
import { MakeDeleteKeywordRoute } from "./deleteKeyword.controller";
import { MakeEditKeywordsRoute } from "./editKeyword.controller";
import { MakeGetKeywordRoute } from "./getKeyword.controller";
import { MakeListKeywordRoute } from "./listKeyword.controller";
import { RouteContext } from "@routes/route.types";

export const MakeKeywordRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateKeywordRoute(router, ctx);
  MakeEditKeywordsRoute(router, ctx);
  MakeGetKeywordRoute(router, ctx);
  MakeListKeywordRoute(router, ctx);
  MakeDeleteKeywordRoute(router, ctx);
};
