import EventList, {
  EventListProps
} from "@components/lists/EventList"
import { events } from "@mock-data/events"
import { Meta, Story } from "@storybook/react/types-6-0"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

const meta: Meta = {
  title: "Components/Lists/EventList",
  component: EventList,
}

export default meta

const Template: Story<EventListProps> = (props) => {
  return <EventList {...props} />
}

const EventListExample = Template.bind({})

const args: EventListProps = {
  events: events.map((f) => ({
    frontmatter: f,
    body: null,
    tableOfContents: { items: [] },
    timeToRead: O.none
  })),
}

EventListExample.args = args

export { EventListExample as EventList }
