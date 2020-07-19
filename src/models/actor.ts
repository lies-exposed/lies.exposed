import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { ImageFileNode } from "./image"

export const ActorFrontmatter = t.type(
  {
    fullName: t.string,
    date: DateFromISOString,
    username: t.string,
    avatar: optionFromNullable(ImageFileNode),
    color: optionFromNullable(t.string),
  },
  "ActorFrontmatter"
)

export type ActorFrontmatter = t.TypeOf<
  typeof ActorFrontmatter
>

export const ActorPageContentFileNode = t.type(
  {
    id: t.string,
    childMarkdownRemark: t.type(
      {
        id: t.string,
        frontmatter: ActorFrontmatter,
        htmlAst: t.object,
      },
      "ActorPageContentFileNodeMarkdownRemark"
    ),
  },
  "ActorPageContentFileNode"
)

export type ActorPageContentFileNode = t.TypeOf<typeof ActorPageContentFileNode>