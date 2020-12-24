import * as t from "io-ts"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { BaseFrontmatter } from "./Frontmatter"
import { ImageFileNode } from "./Image"
import { markdownRemark } from "./Markdown"

const ARTICLE_FRONTMATTER = "ArticleFrontmatter"
export const ArticleFrontmatter = t.strict(
  {
    ...BaseFrontmatter.type.props,
    type: t.literal(ARTICLE_FRONTMATTER),
    title: t.string,
    path: t.string,
    draft: t.boolean,
    featuredImage: ImageFileNode,
    links: optionFromNullable(t.array(t.string)),
  },
  "ArticleFrontmatter"
)

export type ArticleFrontmatter = t.TypeOf<typeof ArticleFrontmatter>

export const ArticleMD = markdownRemark(ArticleFrontmatter, "ArticleMD")

export type ArticleMD = t.TypeOf<typeof ArticleMD>
