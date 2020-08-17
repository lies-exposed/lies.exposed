import { graphql } from "gatsby";

export const TopicFileNodeQuery = graphql`
  fragment TopicFileNode on File {
    relativeDirectory
    childMarkdownRemark {
      id
      frontmatter {
        uuid
        label
        slug
        date
        color
      }
      htmlAst
    }
  }
`

export const TopicPageContentFileNodeQuery = graphql`
  fragment TopicPageContentFileNode on File {
    childMarkdownRemark {
      frontmatter {
        uuid
        label
        slug
        date
        color
      }
      htmlAst
    }
  }
`

