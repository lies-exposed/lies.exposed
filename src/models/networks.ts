import * as t from "io-ts"

export const NetworkPageContentFileNodeFrontmatter = t.type(
  {
    title: t.string,
    path: t.string,
    date: t.string,
    icon: t.string,
    slug: t.string,
    cover: t.string,
    type: t.string,
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

export type NetworkPageContentFileNode = t.TypeOf<typeof NetworkPageContentFileNode>