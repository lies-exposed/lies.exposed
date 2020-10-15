import { Option } from "fp-ts/lib/Option"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Color } from "./Common/Color"
import { ImageFileNode } from "./Image"
import { mdx } from "./Mdx"
import { ActorFrontmatter } from "./actor"

interface GroupFrontmatter {
  uuid: string
  name: string
  date: Date
  avatar: Option<ImageFileNode>
  color: string
  subGroups: Option<GroupFrontmatter[]>
  members: Option<ActorFrontmatter[]>
}

export const GroupFrontmatter: t.RecursiveType<t.ExactType<
  t.Type<GroupFrontmatter, unknown>
>> = t.recursion("GroupFrontmatter", () =>
  t.strict({
    uuid: t.string,
    name: t.string,
    date: DateFromISOString,
    avatar: optionFromNullable(ImageFileNode),
    color: Color,
    subGroups: optionFromNullable(t.array(GroupFrontmatter)),
    members: optionFromNullable(t.array(ActorFrontmatter)),
  })
)

export const GroupMdx = mdx(GroupFrontmatter, "GroupMdx")

export type GroupMdx = t.TypeOf<typeof GroupMdx>
