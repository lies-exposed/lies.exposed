import { ActorFrontmatter } from "@models/actor"
import { GroupFrontmatter, GroupFrontmatterC } from "@models/group"
import * as t from "io-ts"

export const ByGroup = t.strict(
  {
    type: t.literal("Group"),
    group: GroupFrontmatter as any as t.ExactC<t.TypeC<GroupFrontmatterC>>
  },
  "ByGroup"
)
export interface ByGroup {
  type: 'Group'
  group: GroupFrontmatter
}

export const ByActor = t.strict(
  {
    type: t.literal("Actor"),
    actor: ActorFrontmatter,
  },
  "ByActor"
)
export type ByActor = t.TypeOf<typeof ByActor>

export const ByGroupOrActor = t.union([ByGroup, ByActor], "ByGroupOrActor")
export type ByGroupOrActor = ByGroup | ByActor
