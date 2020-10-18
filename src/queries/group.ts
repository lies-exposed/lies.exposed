import { graphql } from "gatsby"

export const query = graphql`
  fragment Group on GroupFrontmatter {
    uuid
    date
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
