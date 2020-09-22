import { graphql } from "gatsby"

export const query = graphql`
  fragment Page on PageFrontmatter {
    title
    path
    date
  }

  fragment PageFileNode on File {
    childMarkdownRemark {
      frontmatter {
        ... on PageFrontmatter {
          ...Page
        }
      }
      htmlAst
      timeToRead
      tableOfContents(absolute: false, maxDepth: 6)
    }
  }
`
