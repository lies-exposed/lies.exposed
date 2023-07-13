import * as t from "io-ts";
import { Group } from "../Group";
import { Project } from "../Project";

export const ForProject = t.strict(
  {
    type: t.literal("Project"),
    project: Project,
  },
  "ForProject",
);

export const ForGroup = t.strict(
  {
    type: t.literal("Group"),
    group: Group,
  },
  "ForGroup",
);

export const For = t.union([ForProject, ForGroup], "For");
export type For = t.TypeOf<typeof For>;
