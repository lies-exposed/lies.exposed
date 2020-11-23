import { graphql } from "gatsby"
export const query = graphql`

  fragment EventMD on Mdx {
    frontmatter {
      ... on Protest {
        ...Protest
      }
      
      ... on Fined {
        ...Fined
      }

      ... on StudyPublished {
        ...StudyPublished
      }

      ... on PublicAnnouncement {
        ...PublicAnnouncement
      }

      ... on Uncategorized {
        ...Uncategorized
      }
      
    }
    tableOfContents
    timeToRead
    body
  }
`
