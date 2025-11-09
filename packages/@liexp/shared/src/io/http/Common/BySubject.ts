import { Schema } from "effect";
import { Actor, type ActorEncoded } from "../Actor.js";
import { Group } from "../Group.js";
import { UUID } from "./UUID.js";

export const ACTOR = Schema.Literal("Actor");
export type ACTOR = typeof ACTOR.Type;
export const GROUP = Schema.Literal("Group");
export type GROUP = typeof GROUP.Type;

export const ByGroupId = Schema.Struct({
  type: GROUP,
  id: UUID,
}).annotations({
  title: "ByGroup",
});

export type ByGroupId = typeof ByGroupId.Type;

export const ByActorId = Schema.Struct({
  type: Schema.Literal("Actor"),
  id: UUID,
}).annotations({
  title: "ByActor",
});
export type ByActorId = typeof ByActorId.Type;

export const BySubjectId = Schema.Union(ByGroupId, ByActorId).annotations({
  title: "ByGroupOrActor",
});
export type BySubjectId = typeof BySubjectId.Type;

export const ByActor = Schema.Struct({
  type: ACTOR,
  id: Schema.suspend((): Schema.Schema<Actor, ActorEncoded> => Actor),
}).annotations({
  title: "ByActor",
});
export type ByActor = typeof ByActor.Type;

export const ByGroup = Schema.Struct({
  type: GROUP,
  id: Group,
}).annotations({
  title: "ByGroup",
});
export type ByGroup = typeof ByGroup.Type;

export const BySubject = Schema.Union(ByActor, ByGroup).annotations({
  title: "ByGroupOrActor",
});
export type BySubject = typeof BySubject.Type;
