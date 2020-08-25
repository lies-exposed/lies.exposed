import { ActorFrontmatter } from "@models/actor"
import { GroupFrontmatter } from "@models/group"
import renderHTMLAST from "@utils/renderHTMLAST"
import { Block } from "baseui/block"
import { Overflow } from "baseui/icon"
import { StyledLink } from "baseui/link"
import { HeadingXLarge, HeadingXSmall } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import Image from "gatsby-image"
import * as React from "react"
import ActorList, { Actor } from "./lists/ActorList"

interface GroupPageContentProps {
  frontmatter: Omit<GroupFrontmatter, "members">
  members: O.Option<Actor[]>
  htmlAst: object
  onMemberClick: (m: ActorFrontmatter) => void
}

export const GroupPageContent: React.FC<GroupPageContentProps> = ({
  frontmatter,
  members,
  onMemberClick,
  htmlAst,
}) => {
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
      {pipe(
        members,
        O.fold(
          () => null,
          (actors) => (
            <Block>
              <HeadingXSmall>Members</HeadingXSmall>
              <ActorList
                actors={actors}
                onActorClick={onMemberClick}
                avatarScale="scale1000"
              />
            </Block>
          )
        )
      )}
      <div className="content">{renderHTMLAST(htmlAst)}</div>
    </>
  )
}
