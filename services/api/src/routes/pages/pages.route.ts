import { type Router } from "express";
import { MakeAddPageRoute } from "./addPage.controller.js";
import { MakeDeleteManyPageRoute } from "./deleteManyPage.controller.js";
import { MakeDeletePageRoute } from "./deletePage.controller.js";
import { MakeEditPageRoute } from "./editPage.controller.js";
import { MakeGetPageRoute } from "./getPage.controller.js";
import { MakeListPageRoute } from "./listPage.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakePageRoutes = (router: Router, ctx: ServerContext): void => {
  MakeAddPageRoute(router, ctx);
  MakeEditPageRoute(router, ctx);
  MakeDeletePageRoute(router, ctx);
  MakeDeleteManyPageRoute(router, ctx);
  MakeGetPageRoute(router, ctx);
  MakeListPageRoute(router, ctx);
};
