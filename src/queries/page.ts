import { graphql } from "gatsby";

export const query = graphql`
  fragment PageContentFileNode on File {
    id
    childMarkdownRemark {
      frontmatter {
        title
        path
        date
        icon
      }
      htmlAst
    }
  }
`
