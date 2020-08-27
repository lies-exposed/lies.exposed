import * as t from "io-ts"
import { date } from "io-ts-types/lib/date"

export const PageFrontmatter = t.interface({
  title: t.string,
  date: date
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
