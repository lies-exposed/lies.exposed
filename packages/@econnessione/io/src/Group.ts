import * as t from "io-ts"
import { DateFromISOStringC } from "io-ts-types/lib/DateFromISOString"
import {
  optionFromNullable,
  OptionFromNullableC
} from "io-ts-types/lib/optionFromNullable"
import { ActorFrontmatter } from "./Actor"
import { BaseFrontmatter } from "./Common/BaseFrontmatter"
import { Color } from "./Common/Color"
import { markdownRemark } from "./Common/Markdown"
import { ImageFileNode } from "./Image"

export const GroupKind = t.union([t.literal("Public"), t.literal("Private")], 'GroupKind')
export type GroupKind = t.TypeOf<typeof GroupKind>

export interface GroupFrontmatterC extends t.Props {
  id: t.StringC
  type: t.LiteralC<"GroupFrontmatter">
  createdAt: DateFromISOStringC
  updatedAt: DateFromISOStringC
  name: t.StringC
  kind: t.UnionC<[t.LiteralC<"Public">, t.LiteralC<"Private">]>
  color: t.StringC
  avatar: OptionFromNullableC<t.Type<ImageFileNode>>
  members: OptionFromNullableC<t.ArrayC<typeof ActorFrontmatter>>
  subGroups: OptionFromNullableC<t.ArrayC<t.ExactType<t.TypeC<GroupFrontmatterC>>>>
}

export type GroupFrontmatterType = t.RecursiveType<
  t.ExactC<t.TypeC<GroupFrontmatterC>>
>

export const GroupFrontmatter: GroupFrontmatterType = t.recursion("GroupFrontmatter", () =>
  t.strict({
    ...BaseFrontmatter.type.props,
    name: t.string,
    type: t.literal("GroupFrontmatter"),
    kind: GroupKind,
    color: Color,
    avatar: optionFromNullable(t.string),
    subGroups: optionFromNullable(t.array(GroupFrontmatter)),
    members: optionFromNullable(t.array(ActorFrontmatter)),
  }) as any
)

export type GroupFrontmatter = t.TypeOfProps<GroupFrontmatterC>

export const GroupMD = markdownRemark(GroupFrontmatter.type, "GroupMD")

export type GroupMD = t.TypeOf<typeof GroupMD>
