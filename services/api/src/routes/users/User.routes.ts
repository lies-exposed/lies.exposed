import { type Router } from "express";
import { MakeUserCreateRoute } from "./userCreate.controller";
import { MakeUserEditRoute } from "./userEdit.controller";
import { MakeUserGetRoute } from "./userGet.controller";
import { MakeUserListRoute } from "./userList.controller";
import { MakeUserLoginRoute } from "./userLogin.controller";
import { MakeUserGetMeRoute } from "./userMe.controller";
import { MakeSignUpUserRoute } from "./userSignUp.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeUserRoutes = (router: Router, ctx: RouteContext): void => {
  MakeUserGetMeRoute(router, ctx);
  MakeUserGetRoute(router, ctx);
  MakeUserListRoute(router, ctx);
  MakeUserLoginRoute(router, ctx);
  MakeSignUpUserRoute(router, ctx);
  MakeUserCreateRoute(router, ctx);
  MakeUserEditRoute(router, ctx);
};
