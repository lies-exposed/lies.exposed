import { graphql } from "gatsby"

export const query = graphql`
  fragment Area on AreaFrontmatter {
    uuid
    label
    date
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
