import { RouteContext } from "@routes/route.types";
import { Router } from "express";
import { MakeUserLoginRoute } from "./userLogin.controller";
// import { MakeUserCreateRoute } from "./userCreate.controller";

export const MakeUserRoutes = (router: Router, ctx: RouteContext): void => {
  MakeUserLoginRoute(router, ctx);
  // MakeUserCreateRoute(router, ctx);
};
