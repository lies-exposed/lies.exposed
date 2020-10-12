import { graphql } from "gatsby"

export const query = graphql`
  fragment Page on PageFrontmatter {
    title
    path
    date
  }

  fragment PageFileNode on File {
    childMdx {
      frontmatter {
        ... on PageFrontmatter {
          ...Page
        }
      }
      body
      timeToRead
      tableOfContents
    }
  }
`
