import { Schema } from "effect";
import { Group } from "../Group.js";
import { Project } from "../Project.js";

export const ForProject = Schema.Struct({
  type: Schema.Literal("Project"),
  project: Project,
}).annotations({
  title: "ForProject",
});

export const ForGroup = Schema.Struct({
  type: Schema.Literal("Group"),
  group: Group,
}).annotations({
  title: "ForGroup",
});

export const For = Schema.Union(ForProject, ForGroup).annotations({
  title: "For",
});
export type For = typeof For.Type;
