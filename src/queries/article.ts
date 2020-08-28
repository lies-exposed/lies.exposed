import { graphql } from "gatsby"

export const query = graphql`
  fragment Article on ArticleFrontmatter {
    uuid
    title
    path
    date
    draft
  }

  fragment ArticleMarkdownRemark on MarkdownRemark {
    frontmatter {
      ... on ArticleFrontmatter {
        ...Article
      }
    }
    htmlAst
  }
`
