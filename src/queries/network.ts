import { graphql } from "gatsby";

export const query = graphql`
  fragment NetworkPageContentFileNode on File {
    relativeDirectory
    childMarkdownRemark {
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
