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

  fragment ActorMarkdownRemark on MarkdownRemark {
    frontmatter {
      ... on ActorFrontmatter {
        ...Actor
      }
    }
    htmlAst
  }
`
