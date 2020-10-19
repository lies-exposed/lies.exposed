import * as t from "io-ts"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Frontmatter } from "./Frontmatter"
import { ImageFileNode } from "./Image"
import { markdownRemark } from "./Markdown"

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

export const ActorMD = markdownRemark(
  ActorFrontmatter,
  "ActorMD"
)

export type ActorMD = t.TypeOf<typeof ActorMD>
