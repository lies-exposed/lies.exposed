import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { mdx } from "./Mdx"

export const PageFrontmatter = t.strict(
  {
    title: t.string,
    date: DateFromISOString,
    path: t.string,
  },
  "PageFrontmatter"
)

export type PageFrontmatter = t.TypeOf<typeof PageFrontmatter>

export const PageMD = mdx(
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
