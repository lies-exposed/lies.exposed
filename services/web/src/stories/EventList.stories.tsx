import EventList, {
  EventListProps,
} from "@components/lists/EventList/EventList"
import { events } from "@mock-data/events"
import { Uncategorized } from "@models/events/Uncategorized"
import { Meta, Story } from "@storybook/react/types-6-0"
import * as A from "fp-ts/lib/Array"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
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
  events: pipe(
    events,
    A.filter(Uncategorized.is),
    A.map((f) => ({
      frontmatter: f,
      body: null,
      tableOfContents: O.none,
      timeToRead: O.none,
    }))
  ),
}

EventListExample.args = args

export { EventListExample as EventList }
