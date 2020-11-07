import { graphql } from "gatsby"

export const query = graphql`
  fragment Area on AreaFrontmatter {
    uuid
    type
    createdAt
    updatedAt
    label
    color
    groups {
      ...Group
    }
    topics {
      ...Topic
    }
    polygon
  }

  fragment AreaMD on Mdx {
    frontmatter {
      ... on AreaFrontmatter {
        ...Area
      }
    }
    tableOfContents
    timeToRead
    body
  }
`
