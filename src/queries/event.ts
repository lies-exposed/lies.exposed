import { graphql } from "gatsby"
export const query = graphql`
  fragment EventFileNode on File {
    relativeDirectory
    childMarkdownRemark {
      id
      frontmatter {
        uuid
        title
        date
        topic
        type
        actors
        groups
        links
      }
      htmlAst
    }
  }
`
