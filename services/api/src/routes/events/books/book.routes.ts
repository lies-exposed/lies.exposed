import { type Router } from "express";
import { MakeCreateBookEventRoute } from "./createBook.controller.js";
import { MakeEditBookEventRoute } from "./editBook.controller.js";
import { MakeGetBookEventRoute } from "./getBook.controller.js";
import { MakeListBookEventRoute } from "./getBookList.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeBookEventsRoutes = (
  router: Router,
  ctx: RouteContext,
): void => {
  MakeGetBookEventRoute(router, ctx);
  MakeCreateBookEventRoute(router, ctx);
  MakeEditBookEventRoute(router, ctx);
  MakeListBookEventRoute(router, ctx);
};
