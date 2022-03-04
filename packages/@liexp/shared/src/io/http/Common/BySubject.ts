import * as t from "io-ts";

export const ByGroup = t.strict(
  {
    type: t.literal("Group"),
    id: t.string,
  },
  "ByGroup"
);

export type ByGroup = t.TypeOf<typeof ByGroup>;

export const ByActor = t.strict(
  {
    type: t.literal("Actor"),
    id: t.string,
  },
  "ByActor"
);
export type ByActor = t.TypeOf<typeof ByActor>;

export const BySubject = t.union([ByGroup, ByActor], "ByGroupOrActor");
export type BySubject = t.TypeOf<typeof BySubject>;
