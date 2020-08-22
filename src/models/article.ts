import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"

export const ArticleFrontmatter = t.type(
  {
    title: t.string,
    date: DateFromISOString,
    path: t.string,
  },
  "ArticleFrontmatter"
)

export type ArticleFrontmatter = t.TypeOf<
  typeof ArticleFrontmatter
>

export const ArticleMarkdownRemark = t.type(
  {
    frontmatter: ArticleFrontmatter,
    htmlAst: t.object,
  },
  "ArticleMarkdownRemark"
)

export type ArticleMarkdownRemark = t.TypeOf<typeof ArticleMarkdownRemark>
