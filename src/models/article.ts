import * as t from "io-ts"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Frontmatter } from "./Frontmatter"
import { markdownRemark } from "./MarkdownRemark"
import { ImageFileNode } from "./image"

export const ArticleFrontmatter = t.strict(
  {
    ...Frontmatter.props,
    title: t.string,
    path: t.string,
    draft: t.boolean,
    featuredImage: ImageFileNode,
    links: optionFromNullable(t.array(t.string)),
  },
  "ArticleFrontmatter"
)

export type ArticleFrontmatter = t.TypeOf<typeof ArticleFrontmatter>

export const ArticleMarkdownRemark = markdownRemark(ArticleFrontmatter, 'ArticleMarkdownRemark')

export type ArticleMarkdownRemark = t.TypeOf<typeof ArticleMarkdownRemark>
