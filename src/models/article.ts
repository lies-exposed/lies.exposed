import * as t from "io-ts"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Frontmatter } from "./Frontmatter"

export const ArticleFrontmatter = t.strict(
  {
    ...Frontmatter.props,
    title: t.string,
    path: t.string,
    draft: t.boolean,
    links: optionFromNullable(t.array(t.string)),
  },
  "ArticleFrontmatter"
)

export type ArticleFrontmatter = t.TypeOf<typeof ArticleFrontmatter>

export const ArticleMarkdownRemark = t.type(
  {
    frontmatter: ArticleFrontmatter,
    htmlAst: t.object,
  },
  "ArticleMarkdownRemark"
)

export type ArticleMarkdownRemark = t.TypeOf<typeof ArticleMarkdownRemark>
