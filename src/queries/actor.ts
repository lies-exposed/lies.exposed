import { graphql } from "gatsby"

export const query = graphql`
  fragment ActorPageContentFileNode on File {
    relativeDirectory
    childMarkdownRemark {
      id
      frontmatter {
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
      htmlAst
    }
  }
`
