import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"

export const ArticleFrontmatter = t.type(
  {
    uuid: t.string,
    title: t.string,
    date: DateFromISOString,
    path: t.string,
    draft: t.boolean,
    links: optionFromNullable(t.array(t.string))
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
