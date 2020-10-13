import { ActorFrontmatter } from '@models/actor'
import * as t from 'io-ts'
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable'

export const ByGroupMembers = t.type(
  {
    groupUUID: t.string,
    members: optionFromNullable(t.array(ActorFrontmatter)),
  },
  "ByGroupMembers"
)
export type ByGroupMembers = t.TypeOf<typeof ByGroupMembers>

export const ByActor = t.type(
  {
    actorUUID: t.string,
  },
  "ByActor"
)
export type ByActor = t.TypeOf<typeof ByActor>

export const ByEitherGroupOrActor = t.union([ByGroupMembers, ByActor])
export type ByEitherGroupOrActor =t.TypeOf<typeof ByEitherGroupOrActor>
