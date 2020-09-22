import { graphql } from "gatsby"

export const query = graphql`
  fragment Article on ArticleFrontmatter {
    uuid
    title
    path
    date
    featuredImage {
      publicURL
      childImageSharp {
        fluid(maxWidth: 600) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    draft
  }

  fragment ArticleMarkdownRemark on MarkdownRemark {
    frontmatter {
      ... on ArticleFrontmatter {
        ...Article
      }
    }
    timeToRead
    tableOfContents(absolute: false)
    htmlAst
  }
`
