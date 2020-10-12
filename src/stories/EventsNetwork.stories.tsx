import {
  EventsNetwork,
  EventsNetworkProps
} from "@components/graph/EventsNetwork"
import { Meta, Story } from "@storybook/react/types-6-0"
import { events } from "data/events"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

const meta: Meta = {
  title: "Example/Graph/EventsNetwork",
  component: EventsNetwork,
}

export default meta

const eventsMD = events.map((e) => ({
  frontmatter: e,
  body: () => "",
  tableOfContents: {},
  timeToRead: O.some(1),
}))

const Template: Story<EventsNetworkProps> = (props) => {
  return <EventsNetwork {...props} />
}

const NetworkGraphExample = Template.bind({})

const args: EventsNetworkProps = {
  width: 600,
  height: 300,
  scale: "all" as "all",
  scalePoint: O.none,
  events: eventsMD,
  selectedActorIds: [],
  selectedGroupIds: [],
  selectedTopicIds: [],
  margin: { horizontal: 30, vertical: 30 },
}

NetworkGraphExample.args = {
  ...args,
  width: args.width,
  height: args.height,
}

NetworkGraphExample.argTypes = {
  minDate: { control: "date" },
  maxDate: { control: "date" },
  graph: { control: "object" },
  selectedEvents: { control: "object" },
}

export { NetworkGraphExample }
