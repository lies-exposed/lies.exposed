import { graphql } from "gatsby";

export const TopicFileNodeQuery = graphql`
  fragment TopicFileNode on File {
    name
    relativeDirectory
    childMarkdownRemark {
      id
      frontmatter {
        label
        slug
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
        label
        slug
        date
        color
      }
      htmlAst
    }
  }
`

