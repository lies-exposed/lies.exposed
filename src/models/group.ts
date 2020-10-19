import * as t from "io-ts"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Color } from "./Common/Color"
import { Frontmatter } from "./Frontmatter"
import { ImageFileNode } from "./Image"
import { markdownRemark } from "./Markdown"
import { ActorFrontmatter } from "./actor"

const GroupType = t.union([t.literal('Public'), t.literal('Private')])

export const GroupFrontmatter = t.strict({
  ...Frontmatter.props,
  name: t.string,
  type: GroupType,
  avatar: optionFromNullable(ImageFileNode),
  color: Color,
  subGroups: optionFromNullable(t.array(t.string)),
  members: optionFromNullable(t.array(ActorFrontmatter)),
}, 'GroupFrontmatter')

export type GroupFrontmatter = t.TypeOf<typeof GroupFrontmatter>

export const GroupMD = markdownRemark(GroupFrontmatter, "GroupMD")

export type GroupMD = t.TypeOf<typeof GroupMD>
