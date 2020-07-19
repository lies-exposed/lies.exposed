import * as t from "io-ts"
// import { Section } from "./layout/Section"

export const PageContentMarkdownRemark = t.interface(
  {
    htmlAst: t.object,
    tableOfContents: t.string,
    frontmatter: t.interface({
      title: t.string,
      // sections: t.array(Section),
    }),
  },
  "PageContentMarkdownRemark"
)

export type PageContentMarkdownRemark = t.TypeOf<
  typeof PageContentMarkdownRemark
>

export const PageContentFileNode = t.strict(
  {
    childMarkdownRemark: PageContentMarkdownRemark,
  },
  "PageContentFileNode"
)
export type PageContentFileNode = t.TypeOf<typeof PageContentFileNode>
