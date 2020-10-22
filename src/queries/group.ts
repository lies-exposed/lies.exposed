import { graphql } from "gatsby"

export const query = graphql`
  fragment Group on GroupFrontmatter {
    uuid
    name
    type
    members {
      ...Actor
    }
    color
    avatar {
      publicURL
      childImageSharp {
        fluid(maxWidth: 600) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    createdAt
    updatedAt
  }

  fragment GroupMD on Mdx {
    frontmatter {
      ... on GroupFrontmatter {
        ...Group
      }
    }
    timeToRead
    tableOfContents
    body
  }
`
