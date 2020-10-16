import { ActorFrontmatter } from "@models/actor"
import { EventMD } from "@models/event"
import { GroupMD } from "@models/group"
import { renderHTML } from "@utils/renderHTML"
import { Block } from "baseui/block"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingXLarge, HeadingXSmall } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import Image from "gatsby-image"
import * as React from "react"
import { EventsNetwork } from "./Graph/EventsNetwork"
import EditButton from "./buttons/EditButton"
import ActorList from "./lists/ActorList"
// import EventList from "./lists/EventList/EventList"

interface GroupPageContentProps extends GroupMD {
  events: EventMD[]
  onMemberClick: (m: ActorFrontmatter) => void
}

export const GroupPageContent: React.FC<GroupPageContentProps> = ({
  frontmatter,
  onMemberClick,
  events,
  body,
}) => {
  return (
    <FlexGrid width="100%">
      <FlexGridItem width="100%">
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
              <Image
                fluid={i.childImageSharp.fluid}
                style={{ width: "100px" }}
              />
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
        <EventsNetwork
          events={events}
          selectedGroupIds={[frontmatter.uuid]}
          selectedActorIds={[]}
          selectedTopicIds={[]}
          scale={"all"}
          scalePoint={O.none}
        />

        <div className="content">{renderHTML({ body })}</div>
        
      </FlexGridItem>
    </FlexGrid>
  )
}
