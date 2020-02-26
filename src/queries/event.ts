import { graphql } from "gatsby"
export const query = graphql`
  fragment EventFileNode on File {
    relativeDirectory
    childMarkdownRemark {
      id
      frontmatter {
        title
        path
        date
        icon
        type
        cover
        actors
        links
        cover
      }
      htmlAst
    }
  }
`
