import { ProjectTransactionListItem } from "@components/lists/EventList/ProjectTransactionListItem"
import { ProtestListItem } from "@components/lists/EventList/ProtestListItem"
import { UncategorizedListItem } from "@components/lists/EventList/UncategorizedListItem"
import {
  EventMD,
  ProjectTransactionMD,
  ProtestMD,
} from "@models/events/EventMetadata"
import { UncategorizedMD } from "@models/events/UncategorizedEvent"
import { Block } from "baseui/block"
import * as React from "react"
import SlickSlider from "react-slick"

export interface EventSliderProps {
  events: EventMD[]
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
          if (UncategorizedMD.is(e)) {
            return <UncategorizedListItem key={e.frontmatter.uuid} item={e} />
          }

          if (ProjectTransactionMD.is(e)) {
            return (
              <ProjectTransactionListItem
                key={e.frontmatter.uuid}
                index={index}
                item={{ ...e.frontmatter, selected: true }}
              />
            )
          }

          if (ProtestMD.is(e)) {
            return <ProtestListItem key={e.frontmatter.uuid} item={e} />
          }

          return <div key={e.frontmatter.type}>{e.frontmatter.type}</div>
        })}
      </SlickSlider>
    </Block>
  )
}
