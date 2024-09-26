import { type Router } from "express";
import { MakeCreateGroupMemberRoute } from "./createGroupMember.controller.js";
import { MakeDeleteGroupMemberRoute } from "./deleteGroupMember.controller.js";
import { MakeEditGroupMemberRoute } from "./editGroupMember.controller.js";
import { MakeGetGroupMemberRoute } from "./getGroupMember.controller.js";
import { MakeListGroupMemberRoute } from "./listGroupMembers.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeGroupMemberRoutes = (
  router: Router,
  ctx: RouteContext,
): void => {
  MakeCreateGroupMemberRoute(router, ctx);
  MakeEditGroupMemberRoute(router, ctx);
  MakeGetGroupMemberRoute(router, ctx);
  MakeListGroupMemberRoute(router, ctx);
  MakeDeleteGroupMemberRoute(router, ctx);
};
