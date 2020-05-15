import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"

export const ArticleFileNodeFrontmatter = t.type(
  {
    title: t.string,
    date: DateFromISOString,
    path: t.string,
  },
  "ArticleFileNodeFrontmatter"
)

export type ArticleFileNodeFrontmatter = t.TypeOf<
  typeof ArticleFileNodeFrontmatter
>

export const ArticleFileNodeChildMarkdownRemark = t.type(
  {
    id: t.string,
    frontmatter: ArticleFileNodeFrontmatter,
    htmlAst: t.object,
  },
  "ArticleFileNodeChildMarkdownRemark"
)

export const ArticleFileNode = t.type(
  {
    id: t.string,
    childMarkdownRemark: ArticleFileNodeChildMarkdownRemark,
  },
  "ArticleFileNode"
)

export type ArticleFileNode = t.TypeOf<typeof ArticleFileNode>
