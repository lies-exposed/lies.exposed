import { type CommandGroup } from "../command.type.js";
import { eventCreate } from "./create.js";
import { eventEdit } from "./edit.js";
import { eventGet } from "./get.js";
import { eventList } from "./list.js";

export const eventGroup: CommandGroup = {
  description: "Manage fact-checked events",
  commands: {
    list: eventList,
    get: eventGet,
    create: eventCreate,
    edit: eventEdit,
  },
};
