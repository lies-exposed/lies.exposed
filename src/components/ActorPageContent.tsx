import { ActorPageContentFileNode } from "@models/actor"
import renderMarkdownAST from "@utils/renderMarkdownAST"
import { HeadingXLarge } from "baseui/typography"
import { graphql } from "gatsby"
import * as React from "react"

type APCFNCMR = ActorPageContentFileNode["childMarkdownRemark"]
export interface ActorPageContentProps extends APCFNCMR {
  coverImage?: { url: string }
}

export const ActorPageContent: React.FC<ActorPageContentProps> = ({
  frontmatter,
  coverImage,
  htmlAst,
}) => {
  return (
    <>
      <HeadingXLarge>{frontmatter.fullName}</HeadingXLarge>
      {coverImage !== undefined ? (
        <img src={coverImage.url} />
      ) : (
        <div />
      )}
      <div className="content">{renderMarkdownAST(htmlAst)}</div>
    </>
  )
}

export const query = graphql`
  fragment ActorPageContentFileNode on File {
    id
    childMarkdownRemark {
      frontmatter {
        title
        path
        date
        icon
        avatar
      }
      htmlAst
    }
  }
`
