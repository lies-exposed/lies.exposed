import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"

export const NetworkPageContentFileNodeFrontmatter = t.type(
  {
    title: t.string,
    date: DateFromISOString,
    icon: t.string,
    slug: t.string,
    cover: optionFromNullable(t.string),
  },
  "NetworkPageContentFileNodeFrontmatter"
)

export const NetworkPageContentFileNode = t.type(
  {
    childMarkdownRemark: t.type({
      frontmatter: NetworkPageContentFileNodeFrontmatter,
      htmlAst: t.any,
    }),
  },
  "NetworkPageContentFileNode"
)

export type NetworkPageContentFileNode = t.TypeOf<
  typeof NetworkPageContentFileNode
>
