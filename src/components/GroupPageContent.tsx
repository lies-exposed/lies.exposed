import { ActorFrontmatter } from "@models/actor"
import { GroupFrontmatter } from "@models/group"
import renderHTMLAST from "@utils/renderHTMLAST"
import { Block } from "baseui/block"
import { HeadingXLarge } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import Image from "gatsby-image"
import * as React from "react"
import ActorList from "./lists/ActorList"
import { StyledLink } from "baseui/link"
import { Overflow } from "baseui/icon"

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
      <Block overrides={{ Block: { style: { textAlign: "right" } } }}>
        <StyledLink
          href={`/admin/#/collections/groups/entries/${frontmatter.uuid}`}
          target="_blank"
        >
          <Overflow size={24} />
        </StyledLink>
      </Block>
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
        avatarScale="scale1000"
      />
      <div className="content">{renderHTMLAST(htmlAst)}</div>
    </>
  )
}
