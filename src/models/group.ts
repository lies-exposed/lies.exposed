import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { ImageFileNode } from "./image"

export const GroupFrontmatter = t.interface(
  {
    uuid: t.string,
    name: t.string,
    date: DateFromISOString,
    avatar: optionFromNullable(ImageFileNode),
    color: optionFromNullable(t.string),
    members: t.array(t.string),
  },
  "ActorFrontmatter"
)

export type GroupFrontmatter = t.TypeOf<typeof GroupFrontmatter>

export const GroupFileNode = t.interface(
  {
    childMarkdownRemark: t.interface(
      {
        frontmatter: GroupFrontmatter,
        htmlAst: t.object,
      },
      "GroupFileNodeChildMarkdownRemark"
    ),
  },
  "GroupFileNode"
)

export type GroupFileNode = t.TypeOf<typeof GroupFileNode>
