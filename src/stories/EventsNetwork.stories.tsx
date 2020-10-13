import {
  EventsNetwork,
  EventsNetworkProps,
} from "@components/Graph/EventsNetwork"
import { EventMD } from "@models/event"
import { Meta, Story } from "@storybook/react/types-6-0"
import { actors } from "data/actors"
import { events } from "data/events"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

const meta: Meta = {
  title: "Example/Graph/EventsNetwork",
  component: EventsNetwork,
}

export default meta

const eventsMD: EventMD[] = events.map((e) => ({
  frontmatter: e,
  body: () => "",
  tableOfContents: { items: [] },
  timeToRead: O.some(1),
}))

const Template: Story<EventsNetworkProps> = (props) => {
  return <EventsNetwork {...props} />
}

const NetworkGraphExample = Template.bind({})

const args: EventsNetworkProps = {
  scale: "all" as "all",
  scalePoint: O.none,
  events: eventsMD,
  selectedActorIds: actors.map((a) => a.uuid),
  selectedGroupIds: [],
  selectedTopicIds: [],
}

NetworkGraphExample.args = args

NetworkGraphExample.argTypes = {
  minDate: { control: "date" },
  maxDate: { control: "date" },
  selectedEvents: { control: "object" },
}

export { NetworkGraphExample }
