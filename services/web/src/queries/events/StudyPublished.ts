import { graphql } from "gatsby"

export const query = graphql`
  fragment StudyPublished on StudyPublished {
    uuid
    title
    type
    createdAt
    updatedAt
    type
    from {
      ... on ByActor {
        type
        actor {
          ...Actor
        }
      }

      ... on ByGroup {
        type
        group {
          ...Group
        }
      }
    }

    createdAt
    updatedAt
  }

  fragment StudyPublishedMD on Mdx {
    frontmatter {
      ... on StudyPublished {
        ...StudyPublished
      }
    }
    tableOfContents
    timeToRead
    body
  }
`
