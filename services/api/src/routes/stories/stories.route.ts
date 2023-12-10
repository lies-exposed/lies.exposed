import { type Router } from "express";
import { MakeCreateStoryRoute } from "./createStory.controller.js";
import { MakeDeleteStoryRoute } from "./deleteStory.controller.js";
import { MakeEditStoryRoute } from "./editStory.controller.js";
import { MakeGetStoryRoute } from "./getStory.controller.js";
import { MakeListStoryRoute } from "./listStory.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeStoriesRoutes = (router: Router, ctx: RouteContext): void => {
  MakeListStoryRoute(router, ctx);
  MakeGetStoryRoute(router, ctx);
  MakeCreateStoryRoute(router, ctx);
  MakeEditStoryRoute(router, ctx);
  MakeDeleteStoryRoute(router, ctx);
};
