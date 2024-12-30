import { type Router } from "express";
import { MakeSettingCreateRoute } from "./settingCreate.controller.js";
import { MakeSettingDeleteRoute } from "./settingDelete.controller.js";
import { MakeSettingEditRoute } from "./settingEdit.controller.js";
import { MakeSettingGetRoute } from "./settingGet.controller.js";
import { MakeSettingListRoute } from "./settingList.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeSettingRoutes = (router: Router, ctx: ServerContext): void => {
  MakeSettingGetRoute(router, ctx);
  MakeSettingListRoute(router, ctx);
  MakeSettingCreateRoute(router, ctx);
  MakeSettingEditRoute(router, ctx);
  MakeSettingDeleteRoute(router, ctx);
};
