import { type Router } from "express";
import { MakeCreateBookEventRoute } from "./createBook.controller";
import { MakeEditBookEventRoute } from "./editBook.controller";
import { MakeGetBookEventRoute } from "./getBook.controller";
import { MakeListBookEventRoute } from "./getBookList.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeBookEventsRoutes = (
  router: Router,
  ctx: RouteContext,
): void => {
  MakeGetBookEventRoute(router, ctx);
  MakeCreateBookEventRoute(router, ctx);
  MakeEditBookEventRoute(router, ctx);
  MakeListBookEventRoute(router, ctx);
};
