import { graphql } from "gatsby"

export const query = graphql`
  fragment Protest on Protest {
    uuid
    title
    date
    createdAt
    updatedAt
    type
    for {
      ... on ForProject {
        type
        project {
          ...Project
        }
      }
    }
    organizers {
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

  fragment ProtestMD on Mdx {
    frontmatter {
      ... on Protest {
        ...Protest
      }
    }
    tableOfContents
    timeToRead
    body
  }
`
