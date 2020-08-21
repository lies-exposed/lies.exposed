import { ActorMarkdownRemark } from "@models/actor"
import renderHTMLAST from "@utils/renderHTMLAST"
import { HeadingXLarge } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import Image from "gatsby-image"
import * as React from "react"

export type ActorPageContentProps = ActorMarkdownRemark

export const ActorPageContent: React.FC<ActorPageContentProps> = ({
  frontmatter,
  htmlAst,
}) => {
  return (
    <>
      <HeadingXLarge>{frontmatter.fullName}</HeadingXLarge>
      {pipe(
        frontmatter.avatar,
        O.fold(
          () => <div />,
          i => (
            <Image fluid={i.childImageSharp.fluid} style={{ width: "100px" }} />
          )
        )
      )}
      <div className="content">{renderHTMLAST(htmlAst)}</div>
    </>
  )
}
