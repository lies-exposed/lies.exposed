import { graphql } from "gatsby";

export const query = graphql`
  fragment NetworkPageContentFileNode on File {
    relativeDirectory
    childMarkdownRemark {
      id
      frontmatter {
        title
        path
        date
        icon
        type
      }
      htmlAst
    }
  }
`
