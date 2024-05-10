import { type Router } from "express";
import { MakeUserCreateRoute } from "./userCreate.controller.js";
import { MakeUserDeleteRoute } from "./userDelete.controller.js";
import { MakeUserEditRoute } from "./userEdit.controller.js";
import { MakeUserGetRoute } from "./userGet.controller.js";
import { MakeUserListRoute } from "./userList.controller.js";
import { MakeUserLoginRoute } from "./userLogin.controller.js";
import { MakeUserGetMeRoute } from "./userMe.controller.js";
import { MakeUserEditMeRoute } from "./userMeEdit.controller.js";
import { MakeSignUpUserRoute } from "./userSignUp.controller.js";
import { MakeUserTGTokenGenerateRoute } from "./userTGTokenGenerate.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeUserRoutes = (router: Router, ctx: RouteContext): void => {
  MakeUserGetMeRoute(router, ctx);
  MakeUserEditMeRoute(router, ctx);
  MakeUserGetRoute(router, ctx);
  MakeUserListRoute(router, ctx);
  MakeUserLoginRoute(router, ctx);
  MakeSignUpUserRoute(router, ctx);
  MakeUserCreateRoute(router, ctx);
  MakeUserEditRoute(router, ctx);
  MakeUserDeleteRoute(router, ctx);
  MakeUserTGTokenGenerateRoute(router, ctx);
};
