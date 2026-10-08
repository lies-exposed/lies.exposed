import { type CommandGroup } from "../command.type.js";
import { settingCreate } from "./setting-create.js";
import { settingEdit } from "./setting-edit.js";
import { settingFind } from "./setting-find.js";
import { settingGet } from "./setting-get.js";

export const settingGroup: CommandGroup = {
  description: "Manage application settings (key-value pairs)",
  commands: {
    list: settingFind,
    get: settingGet,
    create: settingCreate,
    edit: settingEdit,
  },
};
