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
    }
  }
`

export const TopicPageContentFileNodeQuery = graphql`
  fragment TopicPageContentFileNode on File {
    childMarkdownRemark {
      frontmatter {
        title
        path
        date
        icon
        cover
        type
      }
      htmlAst
    }
  }
`

