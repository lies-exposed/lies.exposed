import { graphql } from "gatsby"

export const query = graphql`
  fragment Page on PageFrontmatter {
    uuid
    title
    path
    createdAt
    updatedAt
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
