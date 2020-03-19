import { graphql } from "gatsby"

export const query = graphql`
  fragment ActorFileNode on File {
      id
      relativeDirectory
      childMarkdownRemark {
        id
        frontmatter {
          date
          title
          cover
          avatar
          username
          color
        }
        htmlAst
      }
  }
`
