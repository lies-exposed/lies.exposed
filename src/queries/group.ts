import { graphql } from "gatsby"

export const query = graphql`
  fragment Group on MarkdownRemarkFrontmatter {
    uuid
    date
    name
    members
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

  fragment GroupMarkdownRemark on MarkdownRemark {
    frontmatter {
      ...Group
    }
    fields {
      members {
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
    }
    htmlAst
  }
`
