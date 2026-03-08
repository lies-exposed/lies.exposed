import { Schema } from "effect";
import { Group } from "../Group.js";

export const ForGroup = Schema.Struct({
  type: Schema.Literal("Group"),
  group: Group,
}).annotations({
  title: "ForGroup",
});

export const For = ForGroup.annotations({
  title: "For",
});
export type For = typeof For.Type;
