import { type Router } from "express";
import { MakeCreateStoryRoute } from "./createStory.controller.js";
import { MakeDeleteStoryRoute } from "./deleteStory.controller.js";
import { MakeEditStoryRoute } from "./editStory.controller.js";
import { MakeGetStoryRoute } from "./getStory.controller.js";
import { MakeListStoryRoute } from "./listStory.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeStoriesRoutes = (router: Router, ctx: ServerContext): void => {
  MakeListStoryRoute(router, ctx);
  MakeGetStoryRoute(router, ctx);
  MakeCreateStoryRoute(router, ctx);
  MakeEditStoryRoute(router, ctx);
  MakeDeleteStoryRoute(router, ctx);
};
