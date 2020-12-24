import { graphql } from "gatsby"

export const query = graphql`
fragment Fined on Fined {
  uuid
  type
  createdAt
  updatedAt
  title
  date
  who {
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

  amount {
    amount
    currency
  }

  createdAt
  updatedAt
}

fragment FinedMD on Mdx {
  frontmatter {
    ... on Fined {
      ...Fined
    }
  }
  tableOfContents
  timeToRead
  body
}
`
