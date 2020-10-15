import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Color } from "./Common/Color"
import { ImageFileNode } from "./Image"
import { mdx } from "./Mdx"
import { ActorFrontmatter } from "./actor"

export const GroupFrontmatter = t.strict({
  uuid: t.string,
  name: t.string,
  date: DateFromISOString,
  avatar: optionFromNullable(ImageFileNode),
  color: Color,
  subGroups: optionFromNullable(t.array(t.string)),
  members: optionFromNullable(t.array(ActorFrontmatter)),
})

export type GroupFrontmatter = t.TypeOf<typeof GroupFrontmatter>

export const GroupMdx = mdx(GroupFrontmatter, "GroupMdx")

export type GroupMdx = t.TypeOf<typeof GroupMdx>
