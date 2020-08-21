import { graphql } from "gatsby"

export const query = graphql`
  fragment Article on MarkdownRemarkFrontmatter {
    title
    path
    date
  }

  fragment ArticleMarkdownRemark on MarkdownRemark {
    frontmatter {
      ...Article
    }
    htmlAst
  }
`
