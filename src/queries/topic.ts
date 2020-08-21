import { graphql } from "gatsby"

export const TopicFileNodeQuery = graphql`
  fragment Topic on MarkdownRemarkFrontmatter {
    uuid
    label
    slug
    date
    color
  }

  fragment TopicMarkdownRemark on MarkdownRemark {
    frontmatter {
      ...Topic
    }
    htmlAst
  }
`
