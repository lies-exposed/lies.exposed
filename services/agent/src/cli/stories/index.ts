import { type CommandGroup } from "../command.type.js";
import { storyCreate } from "./create.js";
import { storyEdit } from "./edit.js";
import { storyGet } from "./get.js";
import { storyList } from "./list.js";

export const storyGroup: CommandGroup = {
  description: "Manage stories",
  commands: {
    list: storyList,
    get: storyGet,
    create: storyCreate,
    edit: storyEdit,
  },
};
