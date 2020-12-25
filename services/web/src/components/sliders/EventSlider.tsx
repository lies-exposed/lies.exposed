import { ProjectTransactionListItem } from "@components/lists/EventList/ProjectTransactionListItem"
import { ProtestListItem } from "@components/lists/EventList/ProtestListItem"
import { UncategorizedListItem } from "@components/lists/EventList/UncategorizedListItem"
import { Events } from "@econnessione/io"
import { Block } from "baseui/block"
import * as React from "react"
import SlickSlider from "react-slick"

export interface EventSliderProps {
  events: Events.EventMD[]
}

export const EventSlider: React.FC<EventSliderProps> = (props) => {
  return (
    <Block>
      <SlickSlider
        adaptiveHeight={true}
        infinite={false}
        arrows={true}
        draggable={false}
        dots={true}
      >
        {props.events.map((e, index) => {
          if (Events.Uncategorized.UncategorizedMD.is(e)) {
            return <UncategorizedListItem key={e.frontmatter.id} item={e} />
          }

          if (Events.ProjectTransaction.ProjectTransactionMD.is(e)) {
            return (
              <ProjectTransactionListItem
                key={e.frontmatter.id}
                index={index}
                item={{ ...e.frontmatter, selected: true }}
              />
            )
          }

          if (Events.Protest.ProtestMD.is(e)) {
            return <ProtestListItem key={e.frontmatter.id} item={e} />
          }

          return <div key={e.frontmatter.type}>{e.frontmatter.type}</div>
        })}
      </SlickSlider>
    </Block>
  )
}
