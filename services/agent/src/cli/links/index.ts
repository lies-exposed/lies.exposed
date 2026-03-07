import { type CommandGroup } from "../command.type.js";
import { linkCreate } from "./create.js";
import { linkEdit } from "./edit.js";
import { linkGet } from "./get.js";
import { linkList } from "./list.js";

export const linkGroup: CommandGroup = {
  description: "Manage links (web sources and references)",
  commands: {
    list: linkList,
    get: linkGet,
    create: linkCreate,
    edit: linkEdit,
  },
};
