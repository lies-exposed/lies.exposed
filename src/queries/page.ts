import { graphql } from "gatsby"

export const query = graphql`
  fragment PageContentFileNode on File {
    id
    relativeDirectory
    childMarkdownRemark {
      frontmatter {
        title
        path
        date
        slug
      }
      htmlAst
      tableOfContents(absolute: false, maxDepth: 6)
    }
  }
`
