import { type CommandGroup } from "../command.type.js";
import { mediaCreate } from "./create.js";
import { mediaEdit } from "./edit.js";
import { mediaGet } from "./get.js";
import { mediaList } from "./list.js";

export const mediaGroup: CommandGroup = {
  description: "Manage media (images, videos, files)",
  commands: {
    list: mediaList,
    get: mediaGet,
    create: mediaCreate,
    edit: mediaEdit,
  },
};
