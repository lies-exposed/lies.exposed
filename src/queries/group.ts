import { graphql } from "gatsby"

export const query = graphql`
  fragment GroupPageContentFileNode on File {
    id
    name
    relativeDirectory
    childMarkdownRemark {
      id
      frontmatter {
        date
        name
        members
        color
        avatar {
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
