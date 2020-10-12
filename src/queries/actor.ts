import { graphql } from "gatsby"

export const query = graphql`
  fragment Actor on ActorFrontmatter {
    uuid
    date
    fullName
    username
    color
    avatar {
      publicURL
      childImageSharp {
        fluid(maxWidth: 600) {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }

  fragment ActorMD on Mdx {
    frontmatter {
      ... on ActorFrontmatter {
        ...Actor
      }
    }
    timeToRead
    tableOfContents
    body
  }
`
