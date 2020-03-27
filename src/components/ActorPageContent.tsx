import { ActorPageContentFileNode } from "@models/actor"
import renderMarkdownAST from "@utils/renderMarkdownAST"
import { HeadingXLarge } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import Image from "gatsby-image"
import * as React from "react"

export type ActorPageContentProps = ActorPageContentFileNode["childMarkdownRemark"]

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
            <Image fluid={{ src: i } as any} style={{ width: "100px" }} />
          )
        )
      )}
      <div className="content">{renderMarkdownAST(htmlAst)}</div>
    </>
  )
}
