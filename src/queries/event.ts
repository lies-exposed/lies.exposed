import { graphql } from "gatsby"
export const query = graphql`
  fragment Event on EventFrontmatter {
    uuid
    title
    date
    type
    location
    topics {
      ...Topic
    }
    actors {
      ...Actor
    }
    groups {
      ...Group
    }
    images {
      description
      image {
        publicURL
        childImageSharp {
          fluid(maxWidth: 600) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
    links
  }

  fragment EventMarkdownRemark on MarkdownRemark {
    frontmatter {
      ... on EventFrontmatter {
        ...Event
      }
    }
    tableOfContents(absolute: false)
    htmlAst
  }
`
