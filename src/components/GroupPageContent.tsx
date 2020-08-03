import { ActorFrontmatter } from "@models/actor"
import { GroupFrontmatter } from "@models/group"
import renderHTMLAST from "@utils/renderHTMLAST"
import { HeadingXLarge } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import Image from "gatsby-image"
import * as React from "react"
import ActorList from "./ActorList"

interface GroupPageContentProps {
  frontmatter: Omit<GroupFrontmatter, "members">
  members: ActorFrontmatter[]
  htmlAst: object
}

export const GroupPageContent: React.FC<GroupPageContentProps> = ({
  frontmatter,
  members,
  htmlAst,
}) => {
  const actors = members.map((m) => ({ ...m, selected: false }))
  return (
    <>
      <HeadingXLarge>{frontmatter.name}</HeadingXLarge>
      {pipe(
        frontmatter.avatar,
        O.fold(
          () => <div />,
          (i) => (
            <Image fluid={i.childImageSharp.fluid} style={{ width: "100px" }} />
          )
        )
      )}
      <ActorList
        actors={actors}
        onActorClick={() => {}}
      />
      <div className="content">{renderHTMLAST(htmlAst)}</div>
    </>
  )
}
