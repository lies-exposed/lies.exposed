import { type Router } from "express";
import { MakeGetNationRoute } from "./getNation.controller.js";
import { MakeListNationRoute } from "./listNation.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeNationRoutes = (router: Router, ctx: ServerContext): void => {
  MakeGetNationRoute(router, ctx);
  MakeListNationRoute(router, ctx);
};
