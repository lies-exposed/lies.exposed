import { type Router } from "express";
import { MakeCreateSocialPostRoute } from "./createSocialPost.controller.js";
import { MakeEditSocialPostRoute } from "./editSocialPost.controller.js";
import { MakeGetSocialPostRoute } from "./getSocialPost.controller.js";
import { MakeListSocialPostRoute } from "./listSocialPost.controller.js";
import { MakePublishSocialPostRoute } from "./publishSocialPost.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeSocialPostRoutes = (
  router: Router,
  ctx: ServerContext,
): void => {
  MakeCreateSocialPostRoute(router, ctx);
  MakeEditSocialPostRoute(router, ctx);
  MakeGetSocialPostRoute(router, ctx);
  MakeListSocialPostRoute(router, ctx);
  MakePublishSocialPostRoute(router, ctx);
};
