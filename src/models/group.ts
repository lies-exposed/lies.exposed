import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { ActorFrontmatter } from "./actor"
import { ImageFileNode } from "./image"

export const GroupFrontmatter = t.interface(
  {
    uuid: t.string,
    name: t.string,
    date: DateFromISOString,
    avatar: optionFromNullable(ImageFileNode),
    color: optionFromNullable(t.string),
    members: optionFromNullable(t.array(ActorFrontmatter)),
  },
  "GroupFrontmatter"
)

export type GroupFrontmatter = t.TypeOf<typeof GroupFrontmatter>

export const GroupMarkdownRemark = t.strict(
  {
    frontmatter: GroupFrontmatter,
    htmlAst: t.object,
  },
  "GroupMarkdownRemark"
)

export type GroupMarkdownRemark = t.TypeOf<typeof GroupMarkdownRemark>

// export const GroupFileNode = t.interface(
//   {
//     childMarkdownRemark: GroupMarkdownRemark,
//   },
//   "GroupFileNode"
// )

// export type GroupFileNode = t.TypeOf<typeof GroupFileNode>
