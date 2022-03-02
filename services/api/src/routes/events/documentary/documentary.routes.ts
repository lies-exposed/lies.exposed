import { Router } from "express";
import { RouteContext } from "@routes/route.types";
import { MakeCreateDocumentaryReleaseRoute } from './createDocumentary.controller';
import { MakeGetListDocumentaryEventRoute } from './getListDocumentaries.controller';
import { MakeGetDocumentaryEventRoute } from './getDocumentary.controller';
import { MakeEditDocumentaryEventRoute } from './editDocumentary.controller';

export const MakeDocumentaryReleaseRoutes = (
  router: Router,
  ctx: RouteContext
): void => {
  MakeCreateDocumentaryReleaseRoute(router, ctx);
  MakeEditDocumentaryEventRoute(router, ctx);
  MakeGetDocumentaryEventRoute(router, ctx);
  MakeGetListDocumentaryEventRoute(router, ctx);
};
