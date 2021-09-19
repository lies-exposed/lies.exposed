import { Router } from "express";
import { MakeUserCreateRoute } from "./userCreate.controller";
import { MakeUserListRoute } from "./userList.controller";
import { MakeUserLoginRoute } from "./userLogin.controller";
import { RouteContext } from "@routes/route.types";

export const MakeUserRoutes = (router: Router, ctx: RouteContext): void => {
  MakeUserListRoute(router, ctx);
  MakeUserLoginRoute(router, ctx);
  MakeUserCreateRoute(router, ctx);
};
