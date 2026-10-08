import { type CommandGroup } from "../command.type.js";
import { socialPostCreate } from "./socialpost-create.js";
import { socialPostEdit } from "./socialpost-edit.js";
import { socialPostFind } from "./socialpost-find.js";
import { socialPostGet } from "./socialpost-get.js";

export const socialPostGroup: CommandGroup = {
  description: "Manage social posts (content for social media publishing)",
  commands: {
    list: socialPostFind,
    get: socialPostGet,
    create: socialPostCreate,
    edit: socialPostEdit,
  },
};
