import * as t from "io-ts";
import { UUID } from "./UUID";

export const ByGroup = t.strict(
  {
    type: t.literal("Group"),
    id: UUID,
  },
  "ByGroup",
);

export type ByGroup = t.TypeOf<typeof ByGroup>;

export const ByActor = t.strict(
  {
    type: t.literal("Actor"),
    id: UUID,
  },
  "ByActor",
);
export type ByActor = t.TypeOf<typeof ByActor>;

export const BySubject = t.union([ByGroup, ByActor], "ByGroupOrActor");
export type BySubject = t.TypeOf<typeof BySubject>;
