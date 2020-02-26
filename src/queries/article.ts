import { graphql } from "gatsby"

export const query = graphql`
  fragment ArticleFileNode on File {
    id
    childMarkdownRemark {
      frontmatter {
        title
        path
      }
      htmlAst
    }
  }
`
