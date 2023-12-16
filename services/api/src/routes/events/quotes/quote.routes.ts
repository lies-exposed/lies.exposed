import { type Router } from "express";
import { MakeCreateQuoteRoute } from "./createQuote.controller.js";
import { MakeDeleteQuoteRoute } from "./deleteQuote.controller.js";
import { MakeEditQuoteRoute } from "./editQuote.controller.js";
import { MakeGetQuoteRoute } from "./getQuotes.controller.js";
import { MakeGetListQuoteRoute } from "./listQuotes.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeQuoteRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateQuoteRoute(router, ctx);
  MakeGetQuoteRoute(router, ctx);
  MakeGetListQuoteRoute(router, ctx);
  MakeEditQuoteRoute(router, ctx);
  MakeDeleteQuoteRoute(router, ctx);
};
