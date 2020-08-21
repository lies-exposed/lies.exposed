import { graphql } from "gatsby"

export const query = graphql`
  fragment Page on MarkdownRemarkFrontmatter {
    title
    path
    date
    slug
  }

  fragment PageContentFileNode on File {
    id
    relativeDirectory
    childMarkdownRemark {
      frontmatter {
        ...Page
      }
      htmlAst
      tableOfContents(absolute: false, maxDepth: 6)
    }
  }
`
