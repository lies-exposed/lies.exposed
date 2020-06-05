import { graphql } from "gatsby";

export const query = graphql`
  fragment PageContentFileNode on File {
    id
    relativeDirectory
    childMarkdownRemark {
      frontmatter {
        title
        path
        date
      }
      htmlAst
    }
  }
`
