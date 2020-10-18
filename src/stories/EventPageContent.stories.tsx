import {
  EventPageContent,
  EventPageContentProps,
} from "@components/EventPageContent"
import { firstEvent } from "@mock-data/events"
import { Meta, Story } from "@storybook/react/types-6-0"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

const meta: Meta = {
  title: "Components/Pages/EventPageContent",
  component: EventPageContent,
}

export default meta

const Template: Story<EventPageContentProps> = (props) => {
  return <EventPageContent {...props} />
}

const EventPageContentExample = Template.bind({})

const args: EventPageContentProps = {
  frontmatter: firstEvent,
  body: null,
  tableOfContents: { items: undefined },
  timeToRead: O.none,
}

EventPageContentExample.args = args

export { EventPageContentExample }
