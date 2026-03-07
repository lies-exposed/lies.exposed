import { type CommandGroup } from "../command.type.js";
import { groupCreate } from "./create.js";
import { groupEdit } from "./edit.js";
import { groupGet } from "./get.js";
import { groupList } from "./list.js";

export const groupGroup: CommandGroup = {
  description: "Manage groups (organizations and collectives)",
  commands: {
    list: groupList,
    get: groupGet,
    create: groupCreate,
    edit: groupEdit,
  },
};
