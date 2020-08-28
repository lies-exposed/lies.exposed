import { graphql } from "gatsby"
export const query = graphql`
  fragment Event on EventFrontmatter {
    uuid
    title
    date
    type
    location
    topics {
      ...Topic
    }
    actors {
      ...Actor
    }
    groups {
      ...Group
    }
    links
  }

  fragment EventMarkdownRemark on MarkdownRemark {
    frontmatter {
      ... on EventFrontmatter {
        ...Event
      }
    }
    htmlAst
  }
`
