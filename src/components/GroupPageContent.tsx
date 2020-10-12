import { ActorFrontmatter } from "@models/actor"
import { GroupMdx } from "@models/group"
import { renderHTML } from "@utils/renderHTML"
import { Block } from "baseui/block"
import { HeadingXLarge, HeadingXSmall } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import Image from "gatsby-image"
import * as React from "react"
import EditButton from "./buttons/EditButton"
import ActorList from "./lists/ActorList"

interface GroupPageContentProps extends GroupMdx {
  onMemberClick: (m: ActorFrontmatter) => void
}

export const GroupPageContent: React.FC<GroupPageContentProps> = ({
  frontmatter,
  onMemberClick,
  body,
}) => {
  return (
    <>
      <Block overrides={{ Block: { style: { textAlign: "right" } } }}>
        <div style={{ textAlign: "right", padding: 10 }}>
          <EditButton resourceName="groups" resource={frontmatter} />
        </div>
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
        frontmatter.members,
        O.fold(
          () => null,
          (actors) => (
            <Block>
              <HeadingXSmall>Members</HeadingXSmall>
              <ActorList
                actors={actors.map((a) => ({ ...a, selected: true }))}
                onActorClick={onMemberClick}
                avatarScale="scale1000"
              />
            </Block>
          )
        )
      )}
      <div className="content">{renderHTML({ body })}</div>
    </>
  )
}
