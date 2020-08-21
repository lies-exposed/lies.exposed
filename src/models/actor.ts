import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { ImageFileNode } from "./image"

export const ActorFrontmatter = t.type(
  {
    uuid: t.string,
    fullName: t.string,
    date: DateFromISOString,
    username: t.string,
    avatar: optionFromNullable(ImageFileNode),
    color: optionFromNullable(t.string),
  },
  "ActorFrontmatter"
)

export type ActorFrontmatter = t.TypeOf<typeof ActorFrontmatter>

export const ActorMarkdownRemark = t.type(
  {
    frontmatter: ActorFrontmatter,
    htmlAst: t.object,
  },
  "ActorMarkdownRemark"
)

export type ActorMarkdownRemark = t.TypeOf<typeof ActorMarkdownRemark>
