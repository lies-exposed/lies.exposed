import { graphql } from "gatsby"

export const query = graphql`
  fragment ArticleFileNode on File {
    id
    childMarkdownRemark {
      id
      frontmatter {
        title
        path
        date
      }
      htmlAst
    }
  }
`
