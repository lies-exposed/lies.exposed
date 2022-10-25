import { Router } from "express";
import { MakeUserCreateRoute } from "./userCreate.controller";
import { MakeUserListRoute } from "./userList.controller";
import { MakeUserLoginRoute } from "./userLogin.controller";
import { RouteContext } from "@routes/route.types";
import { MakeUserGetMeRoute } from "./userMe.controller";

export const MakeUserRoutes = (router: Router, ctx: RouteContext): void => {
  MakeUserGetMeRoute(router, ctx);
  MakeUserListRoute(router, ctx);
  MakeUserLoginRoute(router, ctx);
  MakeUserCreateRoute(router, ctx);
};
