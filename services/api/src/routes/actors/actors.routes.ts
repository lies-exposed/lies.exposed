import { type Router } from "express";
import { MakeCreateActorRoute } from "./createActor.controller";
import { MakeDeleteActorRoute } from "./deleteActor.controller";
import { MakeEditActorRoute } from "./editActor.controller";
import { MakeGetActorRoute } from "./getActor.controller";
import { MakeListPageRoute } from "./listActor.controller";
import { MakeUpsertActorFamilyTreeRoute } from "./upsertActorFamilyTree.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeActorRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateActorRoute(router, ctx);
  MakeUpsertActorFamilyTreeRoute(router, ctx);
  MakeEditActorRoute(router, ctx);
  MakeGetActorRoute(router, ctx);
  MakeListPageRoute(router, ctx);
  MakeDeleteActorRoute(router, ctx);
};
