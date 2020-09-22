import { graphql } from "gatsby"

export const query = graphql`
  fragment Group on GroupFrontmatter {
    uuid
    date
    name
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

  fragment GroupMarkdownRemark on MarkdownRemark {
    frontmatter {
      ... on GroupFrontmatter {
        ...Group
      }
    }
    timeToRead
    tableOfContents(absolute: false)
    htmlAst
  }
`
