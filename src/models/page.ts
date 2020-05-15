import * as t from "io-ts"

export const PageContentChildMarkdownRemarkFileNode = t.interface(
  {
    htmlAst: t.object,
    frontmatter: t.interface({
      title: t.string,
    }),
  },
  "PageContentNode"
)

export type PageContentNode = t.TypeOf<
  typeof PageContentChildMarkdownRemarkFileNode
>

export const PageContentFileNode = t.strict(
  {
    childMarkdownRemark: PageContentChildMarkdownRemarkFileNode,
  },
  "PageContentFileNode"
)
export type PageContentFileNode = t.TypeOf<typeof PageContentFileNode>
