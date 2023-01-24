import { type Router } from "express";
import { MakeAddPageRoute } from "./addPage.controller";
import { MakeDeleteManyPageRoute } from "./deleteManyPage.controller";
import { MakeDeletePageRoute } from "./deletePage.controller";
import { MakeEditPageRoute } from "./editPage.controller";
import { MakeGetPageRoute } from "./getPage.controller";
import { MakeListPageRoute } from "./listPage.controller";
import { type RouteContext } from "@routes/route.types";

export const MakePageRoutes = (router: Router, ctx: RouteContext): void => {
  MakeAddPageRoute(router, ctx);
  MakeEditPageRoute(router, ctx);
  MakeDeletePageRoute(router, ctx);
  MakeDeleteManyPageRoute(router, ctx);
  MakeGetPageRoute(router, ctx);
  MakeListPageRoute(router, ctx);
};
