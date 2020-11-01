import { graphql } from "gatsby"
export const query = graphql`
  fragment Event on UncategorizedEventFrontmatter {
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
      author
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
    createdAt
    updatedAt
  }

  fragment EventMDRemark on Mdx {
    frontmatter {
      ... on UncategorizedEventFrontmatter {
        ...Event
      }
    }
    tableOfContents
    timeToRead
    body
  }
`
