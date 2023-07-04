import { type Router } from "express";
import { MakeCreateSocialPostRoute } from "./createSocialPost.controller";
import { MakeGetSocialPostRoute } from './getSocialPost.controller';
import { MakeListSocialPostRoute } from './listSocialPost.controller';
import { type RouteContext } from "@routes/route.types";

export const MakeSocialPostRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateSocialPostRoute(router, ctx);
  MakeGetSocialPostRoute(router, ctx)
  MakeListSocialPostRoute(router, ctx)
};
