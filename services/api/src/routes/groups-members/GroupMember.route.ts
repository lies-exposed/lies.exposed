import { makeCacheMiddleware } from "@liexp/backend/lib/express/middleware/cache.middleware.js";
import { type Router } from "express";
import { MakeCreateGroupMemberRoute } from "./createGroupMember.controller.js";
import { MakeDeleteGroupMemberRoute } from "./deleteGroupMember.controller.js";
import { MakeEditGroupMemberRoute } from "./editGroupMember.controller.js";
import { MakeGetGroupMemberRoute } from "./getGroupMember.controller.js";
import { MakeListGroupMemberRoute } from "./listGroupMembers.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeGroupMemberRoutes = (
  router: Router,
  ctx: ServerContext,
): void => {
  router.use(
    "/groups-members",
    makeCacheMiddleware(ctx.redis, {
      ttl: 1800,
      keyPrefix: "cache:groups-members",
    }),
  );
  MakeCreateGroupMemberRoute(router, ctx);
  MakeEditGroupMemberRoute(router, ctx);
  MakeGetGroupMemberRoute(router, ctx);
  MakeListGroupMemberRoute(router, ctx);
  MakeDeleteGroupMemberRoute(router, ctx);
};
