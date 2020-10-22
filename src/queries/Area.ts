import { graphql } from "gatsby"

export const query = graphql`
  fragment Area on AreaFrontmatter {
    uuid
    label
    color
    groups {
      ...Group
    }
    topics {
      ...Topic
    }
    polygon
    createdAt
    updatedAt
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
