import { graphql } from "gatsby"

export const TopicFileNodeQuery = graphql`
  fragment Topic on TopicFrontmatter {
    uuid
    label
    slug
    date
    color
  }

  fragment TopicMarkdownRemark on MarkdownRemark {
    frontmatter {
      ... on TopicFrontmatter {
        ...Topic
      }
    }
    tableOfContents(absolute: false)
    timeToRead
    htmlAst
  }
`
