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

  fragment EventMDRemark on Mdx {
    frontmatter {
      ... on EventFrontmatter {
        ...Event
      }
    }
    tableOfContents
    timeToRead
    body
  }
`
