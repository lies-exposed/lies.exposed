import { type Router } from "express";
import { MakeSettingCreateRoute } from "./settingCreate.controller.js";
import { MakeSettingDeleteRoute } from "./settingDelete.controller.js";
import { MakeUserEditRoute } from "./settingEdit.controller.js";
import { MakeSettingGetRoute } from "./settingGet.controller.js";
import { MakeSettingListRoute } from "./settingList.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeSettingRoutes = (router: Router, ctx: RouteContext): void => {
  MakeSettingGetRoute(router, ctx);
  MakeSettingListRoute(router, ctx);
  MakeSettingCreateRoute(router, ctx);
  MakeUserEditRoute(router, ctx);
  MakeSettingDeleteRoute(router, ctx);
};
