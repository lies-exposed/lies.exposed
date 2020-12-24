import { graphql } from "gatsby";

export const query = graphql`
  fragment NetworkPageContentFileNode on File {
    relativeDirectory
    childMdx {
      frontmatter {
        title
        topic
        path
        date
      }
      body
    }
  }
`
