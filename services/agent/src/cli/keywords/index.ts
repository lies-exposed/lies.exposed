import { type CommandGroup } from "../command.type.js";
import { keywordCreate } from "./keyword-create.js";
import { keywordEdit } from "./keyword-edit.js";
import { keywordFind } from "./keyword-find.js";
import { keywordGet } from "./keyword-get.js";

export const keywordGroup: CommandGroup = {
  description: "Manage keywords (topics and tags)",
  commands: {
    list: keywordFind,
    get: keywordGet,
    create: keywordCreate,
    edit: keywordEdit,
  },
};
