import { graphql } from "gatsby"
export const query = graphql`
  fragment Uncategorized on Uncategorized {
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

  fragment UncategorizedMD on Mdx {
    frontmatter {
      ... on Uncategorized {
        ...Uncategorized
      }
      
    }
    tableOfContents
    timeToRead
    body
  }
`
