import * as t from "io-ts"
import { Frontmatter } from "./Frontmatter"
import { markdownRemark } from "./Markdown"

export const PageFrontmatter = t.strict(
  {
    ...Frontmatter.props,
    title: t.string,
    path: t.string,
  },
  "PageFrontmatter"
)

export type PageFrontmatter = t.TypeOf<typeof PageFrontmatter>

export const PageMD = markdownRemark(
  PageFrontmatter,
  "PageMD"
)

export type PageMD = t.TypeOf<typeof PageMD>

export const PageContentFileNode = t.strict(
  {
    childMdx: PageMD,
  },
  "PageContentFileNode"
)
export type PageContentFileNode = t.TypeOf<typeof PageContentFileNode>
