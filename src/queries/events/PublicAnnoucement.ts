import { graphql } from "gatsby"

export const query = graphql`
  fragment PublicAnnouncement on PublicAnnouncement {
    uuid
    title
    date
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

    # for {
    #   ... on ForProject {
    #     type
    #     project {
    #       ...Project
    #     }
    #   }
    #   ... on ForGroup {
    #     type
    #     group {
    #       ...Group
    #     }
    #   }
    # }

    publishedBy {
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

  fragment PublicAnnouncementMD on Mdx {
    frontmatter {
      ... on PublicAnnouncement {
        ...PublicAnnouncement
      }
    }
    tableOfContents
    timeToRead
    body
  }
`
