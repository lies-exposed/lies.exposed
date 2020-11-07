import { graphql } from "gatsby"

export const query = graphql`
  fragment Article on ArticleFrontmatter {
    uuid
    type
    createdAt
    updatedAt

    title
    path
    
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

  fragment ArticleMD on Mdx {
    frontmatter {
      ... on ArticleFrontmatter {
        ...Article
      }
    }
    timeToRead
    tableOfContents
    body
  }
`
