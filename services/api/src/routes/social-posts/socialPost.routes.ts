import { type Router } from "express";
import { MakeCreateSocialPostRoute } from "./createSocialPost.controller";
import { MakeEditSocialPostRoute } from "./editSocialPost.controller";
import { MakeGetSocialPostRoute } from "./getSocialPost.controller";
import { MakeListSocialPostRoute } from "./listSocialPost.controller";
import { MakePublishSocialPostRoute } from "./publishSocialPost.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeSocialPostRoutes = (
  router: Router,
  ctx: RouteContext,
): void => {
  MakeCreateSocialPostRoute(router, ctx);
  MakeEditSocialPostRoute(router, ctx);
  MakeGetSocialPostRoute(router, ctx);
  MakeListSocialPostRoute(router, ctx);
  MakePublishSocialPostRoute(router, ctx);
};
