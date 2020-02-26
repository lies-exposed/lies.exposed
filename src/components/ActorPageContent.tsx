import { ActorPageContentFileNode } from "@models/actor"
import { ImageFileNode } from "@models/image"
import renderMarkdownAST from "@utils/renderMarkdownAST"
import { HeadingXLarge } from "baseui/typography"
import { graphql } from "gatsby"
import * as React from "react"

type APCFNCMR = ActorPageContentFileNode["childMarkdownRemark"]
export interface ActorPageContentProps extends APCFNCMR {
  coverImage?: ImageFileNode
}

export const ActorPageContent: React.FC<ActorPageContentProps> = ({
  frontmatter,
  coverImage,
  htmlAst,
}) => {
  return (
    <>
      <HeadingXLarge>{frontmatter.title}</HeadingXLarge>
      {coverImage !== undefined ? (
        <img src={coverImage.childImageSharp.fixed.src} />
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
