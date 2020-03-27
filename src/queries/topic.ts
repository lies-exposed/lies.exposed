import { graphql } from "gatsby";

export const TopicFileNodeQuery = graphql`
  fragment TopicFileNode on File {
    name
    relativeDirectory
    childMarkdownRemark {
      id
      frontmatter {
        title
        date
      }
      htmlAst
    }
  }
`

export const TopicPageContentFileNodeQuery = graphql`
  fragment TopicPageContentFileNode on File {
    id
    name
    childMarkdownRemark {
      frontmatter {
        title
        date
        type
        color
      }
      htmlAst
    }
  }
`

