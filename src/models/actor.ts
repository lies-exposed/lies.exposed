import * as t from "io-ts"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Frontmatter } from "./Frontmatter"
import { ImageFileNode } from "./image"

export const ActorFrontmatter = t.strict(
  {
    ...Frontmatter.props,
    fullName: t.string,
    username: t.string,
    avatar: optionFromNullable(ImageFileNode),
    color: t.string,
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
