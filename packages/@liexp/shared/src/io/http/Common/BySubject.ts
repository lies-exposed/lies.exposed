import * as t from "io-ts";
import { Actor } from "../Actor.js";
import { Group } from "../Group.js";
import { UUID } from "./UUID.js";

export const ACTOR = t.literal("Actor");
export type ACTOR = t.TypeOf<typeof ACTOR>;
export const GROUP = t.literal("Group");
export type GROUP = t.TypeOf<typeof GROUP>;

export const ByGroupId = t.strict(
  {
    type: GROUP,
    id: UUID,
  },
  "ByGroup",
);

export type ByGroupId = t.TypeOf<typeof ByGroupId>;

export const ByActorId = t.strict(
  {
    type: t.literal("Actor"),
    id: UUID,
  },
  "ByActor",
);
export type ByActorId = t.TypeOf<typeof ByActorId>;

export const BySubjectId = t.union([ByGroupId, ByActorId], "ByGroupOrActor");
export type BySubjectId = t.TypeOf<typeof BySubjectId>;

export const ByActor = t.strict(
  {
    type: ACTOR,
    id: Actor,
  },
  "ByActor",
);
export type ByActor = t.TypeOf<typeof ByActor>;

export const ByGroup = t.strict(
  {
    type: GROUP,
    id: Group,
  },
  "ByGroup",
);
export type ByGroup = t.TypeOf<typeof ByGroup>;

export const BySubject = t.union([ByActor, ByGroup], "ByGroupOrActor");
export type BySubject = t.TypeOf<typeof BySubject>;
