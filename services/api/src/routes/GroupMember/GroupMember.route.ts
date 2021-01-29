import { RouteContext } from "@routes/route.types";
import { Router } from "express";
import { MakeCreateGroupMemberRoute } from "./createGroupMember.controller";
import { MakeDeleteGroupMemberRoute } from "./deleteGroupMember.controller";
import { MakeEditGroupMemberRoute } from "./editGroupMember.controller";
import { MakeGetGroupMemberRoute } from "./getGroupMember.controller";
import { MakeListGroupMemberRoute } from "./getGroupMembers.controller";

export const MakeGroupMemberRoutes = (
  router: Router,
  ctx: RouteContext
): void => {
  MakeCreateGroupMemberRoute(router, ctx);
  MakeEditGroupMemberRoute(router, ctx);
  MakeGetGroupMemberRoute(router, ctx);
  MakeListGroupMemberRoute(router, ctx);
  MakeDeleteGroupMemberRoute(router, ctx);
};
