import { graphql } from "gatsby";

export const TopicFileNodeQuery = graphql`
  fragment TopicFileNode on File {
    relativeDirectory
    childMarkdownRemark {
      id
      frontmatter {
        title
        slug
      }
      htmlAst
    }
  }
`

export const TopicPageContentFileNodeQuery = graphql`
  fragment TopicPageContentFileNode on File {
    id
    childMarkdownRemark {
      frontmatter {
        title
        date
        icon
        type
        slug
      }
      htmlAst
    }
  }
`

