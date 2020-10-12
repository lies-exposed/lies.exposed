import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { mdx } from "./Mdx"
import { ActorFrontmatter } from "./actor"
import { ImageFileNode } from "./image"

export const GroupFrontmatter = t.strict(
  {
    uuid: t.string,
    name: t.string,
    date: DateFromISOString,
    avatar: optionFromNullable(ImageFileNode),
    color: t.string,
    members: optionFromNullable(t.array(ActorFrontmatter)),
  },
  "GroupFrontmatter"
)

export type GroupFrontmatter = t.TypeOf<typeof GroupFrontmatter>

export const GroupMdx = mdx(
  GroupFrontmatter,
  "GroupMdx"
)

export type GroupMdx = t.TypeOf<typeof GroupMdx>
