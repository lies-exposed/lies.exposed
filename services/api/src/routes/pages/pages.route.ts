import { RouteContext } from "@routes/route.types";
import { Router } from "express";
import { MakeAddPageRoute } from "./addPage.controller";
import { MakeDeleteManyPageRoute } from "./deleteManyPage.controller";
import { MakeDeletePageRoute } from "./deletePage.controller";
import { MakeEditPageRoute } from "./editPage.controller";
import { MakeGetPageRoute } from "./getPage.controller";
import { MakeListPageRoute } from "./listPage.controller";

export const MakePageRoutes = (router: Router, ctx: RouteContext): void => {
  MakeAddPageRoute(router, ctx);
  MakeEditPageRoute(router, ctx);
  MakeDeletePageRoute(router, ctx);
  MakeDeleteManyPageRoute(router, ctx);
  MakeGetPageRoute(router, ctx);
  MakeListPageRoute(router, ctx);
};
