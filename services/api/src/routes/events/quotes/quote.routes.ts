import { type Router } from "express";
import { MakeCreateQuoteRoute } from "./createQuote.controller";
import { MakeDeleteQuoteRoute } from "./deleteQuote.controller";
import { MakeEditQuoteRoute } from "./editQuote.controller";
import { MakeGetQuoteRoute } from "./getQuotes.controller";
import { MakeGetListQuoteRoute } from "./listQuotes.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeQuoteRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateQuoteRoute(router, ctx);
  MakeGetQuoteRoute(router, ctx);
  MakeGetListQuoteRoute(router, ctx);
  MakeEditQuoteRoute(router, ctx);
  MakeDeleteQuoteRoute(router, ctx);
};
