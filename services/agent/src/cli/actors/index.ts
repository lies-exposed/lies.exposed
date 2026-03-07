import { type CommandGroup } from "../command.type.js";
import { actorCreate } from "./actor-create.js";
import { actorEdit } from "./actor-edit.js";
import { actorFindAvatar } from "./actor-find-avatar.js";
import { actorFind } from "./actor-find.js";
import { actorGet } from "./actor-get.js";

export const actorGroup: CommandGroup = {
  description: "Manage actors (people and entities)",
  commands: {
    list: actorFind,
    get: actorGet,
    create: actorCreate,
    edit: actorEdit,
    "find-avatar": actorFindAvatar,
  },
};
