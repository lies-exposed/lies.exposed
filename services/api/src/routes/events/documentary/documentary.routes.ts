import { Router } from "express";
import { MakeCreateDocumentaryReleaseRoute } from './createDocumentary.controller';
import { MakeEditDocumentaryEventRoute } from './editDocumentary.controller';
import { MakeGetDocumentaryEventRoute } from './getDocumentary.controller';
import { RouteContext } from "@routes/route.types";
import { MakeGetListDocumentaryEventRoute } from './getListDocumentaries.controller';

export const MakeDocumentaryReleaseRoutes = (
  router: Router,
  ctx: RouteContext
): void => {
  MakeCreateDocumentaryReleaseRoute(router, ctx);
  MakeEditDocumentaryEventRoute(router, ctx);
  MakeGetDocumentaryEventRoute(router, ctx);
  MakeGetListDocumentaryEventRoute(router, ctx);
};
