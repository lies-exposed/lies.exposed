import { graphql } from "gatsby"

export const query = graphql`
  fragment Page on PageFrontmatter {
    uuid
    type
    title
    path
    createdAt
    updatedAt
  }

  fragment PageMD on Mdx {
    frontmatter {
      ... on PageFrontmatter {
        ...Page
      }
    }
    body
    timeToRead
    tableOfContents
  }
`
