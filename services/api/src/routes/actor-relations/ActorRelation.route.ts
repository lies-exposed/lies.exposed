import { makeCacheMiddleware } from "@liexp/backend/lib/express/middleware/cache.middleware.js";
import { type Router } from "express";
import { MakeCreateActorRelationRoute } from "./createActorRelation.controller.js";
import { MakeDeleteActorRelationRoute } from "./deleteActorRelation.controller.js";
import { MakeEditActorRelationRoute } from "./editActorRelation.controller.js";
import { MakeGetActorRelationRoute } from "./getActorRelation.controller.js";
import { MakeGetActorRelationTreeRoute } from "./getActorRelationTree.controller.js";
import { MakeListActorRelationRoute } from "./listActorRelation.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeActorRelationRoutes = (
  router: Router,
  ctx: ServerContext,
): void => {
  router.use(
    "/actor-relations",
    makeCacheMiddleware(ctx.redis, {
      ttl: 1800,
      keyPrefix: "cache:actor-relations",
    }),
  );
  MakeCreateActorRelationRoute(router, ctx);
  MakeEditActorRelationRoute(router, ctx);
  MakeGetActorRelationRoute(router, ctx);
  MakeListActorRelationRoute(router, ctx);
  MakeDeleteActorRelationRoute(router, ctx);
  MakeGetActorRelationTreeRoute(router, ctx);
};
