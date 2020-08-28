import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"

export const PageFrontmatter = t.type({
  title: t.string,
  date: DateFromISOString,
  path: t.string
}, 'PageFrontmatter')

export type PageFrontmatter = t.TypeOf<typeof PageFrontmatter>

export const PageMarkdownRemark = t.interface(
  {
    htmlAst: t.object,
    tableOfContents: t.string,
    frontmatter: PageFrontmatter,
  },
  "PageMarkdownRemark"
)

export type PageMarkdownRemark = t.TypeOf<
  typeof PageMarkdownRemark
>

export const PageContentFileNode = t.strict(
  {
    childMarkdownRemark: PageMarkdownRemark,
  },
  "PageContentFileNode"
)
export type PageContentFileNode = t.TypeOf<typeof PageContentFileNode>
