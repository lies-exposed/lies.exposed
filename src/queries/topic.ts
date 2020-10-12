import { graphql } from "gatsby"

export const TopicFileNodeQuery = graphql`
  fragment Topic on TopicFrontmatter {
    uuid
    label
    slug
    date
    color
  }

  fragment TopicMD on Mdx {
    frontmatter {
      ... on TopicFrontmatter {
        ...Topic
      }
    }
    tableOfContents
    timeToRead
    body
  }
`
