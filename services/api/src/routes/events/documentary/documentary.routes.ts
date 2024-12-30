import { type Router } from "express";
import { MakeCreateDocumentaryReleaseRoute } from "./createDocumentary.controller.js";
import { MakeEditDocumentaryEventRoute } from "./editDocumentary.controller.js";
import { MakeGetDocumentaryEventRoute } from "./getDocumentary.controller.js";
import { MakeGetListDocumentaryEventRoute } from "./getListDocumentaries.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeDocumentaryReleaseRoutes = (
  router: Router,
  ctx: ServerContext,
): void => {
  MakeCreateDocumentaryReleaseRoute(router, ctx);
  MakeEditDocumentaryEventRoute(router, ctx);
  MakeGetDocumentaryEventRoute(router, ctx);
  MakeGetListDocumentaryEventRoute(router, ctx);
};
