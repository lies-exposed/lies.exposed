import { graphql } from "gatsby"

export const query = graphql`
  fragment Project on ProjectFrontmatter {
    uuid
    name
    startDate
    endDate
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

    date
  }

  fragment ProjectMD on Mdx {
    frontmatter {
      ... on ProjectFrontmatter {
        ...Project
      }
    }
    timeToRead
    tableOfContents
    body
  }
`
