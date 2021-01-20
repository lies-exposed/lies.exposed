import * as t from "io-ts";

export const ByGroup = t.strict(
  {
    type: t.literal("Group"),
    group: t.string,
  },
  "ByGroup"
);

export type ByGroup = t.TypeOf<typeof ByGroup>;

export const ByActor = t.strict(
  {
    type: t.literal("Actor"),
    actor: t.string
  },
  "ByActor"
);
export type ByActor = t.TypeOf<typeof ByActor>;

export const ByGroupOrActor = t.union([ByGroup, ByActor], "ByGroupOrActor");
export type ByGroupOrActor = ByGroup | ByActor;
