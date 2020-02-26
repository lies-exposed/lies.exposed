import { graphql } from "gatsby"

export const query = graphql`
  fragment ActorFileNode on File {
      id
      relativeDirectory
      childMarkdownRemark {
        frontmatter {
          title
          cover
          avatar
          username
        }
        htmlAst
      }
  }
`
