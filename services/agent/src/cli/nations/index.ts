import { type CommandGroup } from "../command.type.js";
import { nationGet } from "./get.js";
import { nationList } from "./list.js";

export const nationGroup: CommandGroup = {
  description: "Manage nations",
  commands: {
    list: nationList,
    get: nationGet,
  },
};
