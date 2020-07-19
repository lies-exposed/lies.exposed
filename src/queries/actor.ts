import { graphql } from "gatsby"

export const query = graphql`
  fragment ActorPageContentFileNode on File {
    id
    relativeDirectory
    childMarkdownRemark {
      id
      frontmatter {
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
