import { graphql } from "gatsby";

export const query = graphql`
  fragment NetworkPageContentFileNode on File {
    relativeDirectory
    childMarkdownRemark {
      id
      frontmatter {
        title
        topic
        path
        date
      }
      htmlAst
    }
  }
`
