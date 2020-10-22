import { ActorFrontmatter } from '@models/actor'
import { GroupFrontmatter } from '@models/group'
import * as t from 'io-ts'

export const ByGroup = t.type(
  {
    __type: t.literal('Group'),
    group: GroupFrontmatter,
  },
  "ByGroup"
)
export type ByGroup = t.TypeOf<typeof ByGroup>

export const ByActor = t.type(
  {
    __type: t.literal('Actor'),
    actor: ActorFrontmatter
  },
  "ByActor"
)
export type ByActor = t.TypeOf<typeof ByActor>

export const ByGroupOrActor = t.union([ByGroup, ByActor], 'ByGroupOrActor')
export type ByGroupOrActor =t.TypeOf<typeof ByGroupOrActor>
