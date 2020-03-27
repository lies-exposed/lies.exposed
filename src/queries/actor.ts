import { graphql } from "gatsby"

export const query = graphql`
  fragment ActorPageContentFileNode on File {
    id
    relativeDirectory
    childMarkdownRemark {
      id
      frontmatter {
        date
        title
        username
        avatar {
          childImageSharp {
            fluid(maxWidth: 600) {
              ...GatsbyImageSharpFluid
            }
          }
        }   
        color
      }
      htmlAst
    }
  }
`
