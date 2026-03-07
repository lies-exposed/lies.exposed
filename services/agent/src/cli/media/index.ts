import { type CommandGroup } from "../command.type.js";
import { mediaGet } from "./get.js";
import { mediaList } from "./list.js";

export const mediaGroup: CommandGroup = {
  description: "Manage media (images, videos, files)",
  commands: {
    list: mediaList,
    get: mediaGet,
  },
};
