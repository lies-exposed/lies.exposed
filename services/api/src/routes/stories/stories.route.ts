import { type Router } from "express";
import { MakeCreateStoryRoute } from "./createStory.controller";
import { MakeDeleteStoryRoute } from "./deleteStory.controller";
import { MakeEditStoryRoute } from "./editStory.controller";
import { MakeGetStoryRoute } from "./getStory.controller";
import { MakeListStoryRoute } from "./listStory.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeStoriesRoutes = (router: Router, ctx: RouteContext): void => {
  MakeListStoryRoute(router, ctx);
  MakeGetStoryRoute(router, ctx);
  MakeCreateStoryRoute(router, ctx);
  MakeEditStoryRoute(router, ctx);
  MakeDeleteStoryRoute(router, ctx);
};
