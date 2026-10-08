import { type CommandGroup } from "../command.type.js";
import { graphCreate } from "./graph-create.js";
import { graphEdit } from "./graph-edit.js";
import { graphFind } from "./graph-find.js";
import { graphGet } from "./graph-get.js";

export const graphGroup: CommandGroup = {
  description: "Manage graphs (visualizations and data charts)",
  commands: {
    list: graphFind,
    get: graphGet,
    create: graphCreate,
    edit: graphEdit,
  },
};
