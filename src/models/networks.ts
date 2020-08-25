import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"

export const NetworkPageFrontmatter = t.type(
  {
    title: t.string,
    date: DateFromISOString,
    slug: t.string,
    cover: optionFromNullable(t.string),
  },
  "NetworkPageContentFileNodeFrontmatter"
)

export const NetworkPageMarkdownRemark = t.type(
  {
    
      frontmatter: NetworkPageFrontmatter,
      htmlAst: t.any,
  },
  "NetworkPageMarkdownRemark"
)

export type NetworkPageMarkdownRemark = t.TypeOf<
  typeof NetworkPageMarkdownRemark
>
