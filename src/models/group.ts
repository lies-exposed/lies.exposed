import * as t from "io-ts"
import { DateFromISOStringC } from 'io-ts-types/lib/DateFromISOString'
import { optionFromNullable, OptionFromNullableC } from "io-ts-types/lib/optionFromNullable"
import { Color } from "./Common/Color"
import { Frontmatter } from "./Frontmatter"
import { ImageFileNode } from "./Image"
import { markdownRemark } from "./Markdown"
import { ActorFrontmatter } from "./actor"

const GroupType = t.union([t.literal("Public"), t.literal("Private")])
export type GroupType = t.TypeOf<typeof GroupType>

export interface GroupFrontmatterC extends t.Props {
  uuid: t.StringC
  createdAt: DateFromISOStringC
  updatedAt: DateFromISOStringC
  name: t.StringC
  type: t.UnionC<[t.LiteralC<'Public'>, t.LiteralC<'Private'>]>
  color: t.StringC,
  avatar: OptionFromNullableC<t.Type<ImageFileNode>>
  members: OptionFromNullableC<t.ArrayC<typeof ActorFrontmatter>>
  subGroups: OptionFromNullableC<t.ArrayC<t.TypeC<GroupFrontmatterC>>>
}

export type GroupFrontmatterType = t.RecursiveType<t.ExactC<t.TypeC<GroupFrontmatterC>>>

export const GroupFrontmatter: GroupFrontmatterType = t.recursion("Group", () =>
  t.strict({
    ...Frontmatter.props,
    name: t.string,
    type: GroupType,
    color: Color,
    avatar: optionFromNullable(ImageFileNode),
    subGroups: optionFromNullable(t.array(GroupFrontmatter)),
    members: optionFromNullable(t.array(ActorFrontmatter)),
  }) as any
)

export type GroupFrontmatter = t.TypeOf<typeof GroupFrontmatter['type']>

export const GroupMD = markdownRemark(GroupFrontmatter.type, "GroupMD")

export type GroupMD = t.TypeOf<typeof GroupMD>
