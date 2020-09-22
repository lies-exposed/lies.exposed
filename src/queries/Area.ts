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

  fragment AreaMarkdownRemark on MarkdownRemark {
    frontmatter {
      ... on AreaFrontmatter {
        ...Area
      }
    }
    tableOfContents(absolute: false)
    timeToRead
    htmlAst
  }
`
