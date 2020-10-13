import { ActorFrontmatter } from '@models/actor'
import { GroupFrontmatter } from '@models/group'
import * as t from 'io-ts'

export const ByGroup = t.type(
  {
    __type: t.literal('Group'),
    group: GroupFrontmatter,
  },
  "ByGroupMembers"
)
export type ByGroupMembers = t.TypeOf<typeof ByGroup>

export const ByActor = t.type(
  {
    __type: t.literal('Actor'),
    actor: ActorFrontmatter
  },
  "ByActor"
)
export type ByActor = t.TypeOf<typeof ByActor>

export const ByEitherGroupOrActor = t.union([ByGroup, ByActor])
export type ByEitherGroupOrActor =t.TypeOf<typeof ByEitherGroupOrActor>
