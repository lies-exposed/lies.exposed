import { type CommandGroup } from "../command.type.js";
import { areaGet } from "./get.js";
import { areaList } from "./list.js";

export const areaGroup: CommandGroup = {
  description: "Manage geographic areas",
  commands: {
    list: areaList,
    get: areaGet,
  },
};
