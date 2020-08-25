import { graphql } from "gatsby"
export const query = graphql`
  fragment Event on MarkdownRemarkFrontmatter {
    uuid
    title
    date
    type
    location
    topics
    actors
    groups
    links
  }

  fragment EventMarkdownRemark on MarkdownRemark {
    frontmatter {
      ...Event
    }
    fields {

      topics {
        uuid
        label
        slug
        date
        color
      }

      actors {
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
      groups {
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
    }
    htmlAst
  }
`
