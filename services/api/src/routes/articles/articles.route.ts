import { RouteContext } from "@routes/route.types";
import { Router } from "express";
import { MakeCreateArticleRoute } from "./createArticle.controller";
import { MakeGetArticleRoute } from "./getArticle.controller";
import { MakeListArticlesRoute } from "./listArticles.controller";

export const MakeArticlesRoutes = (router: Router, ctx: RouteContext): void => {
  MakeListArticlesRoute(router, ctx);
  MakeGetArticleRoute(router, ctx);
  MakeCreateArticleRoute(router, ctx);
};
