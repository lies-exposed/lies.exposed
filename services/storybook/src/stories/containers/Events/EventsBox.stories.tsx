import EventsBox, {
  type EventsBoxProps
} from "@liexp/ui/containers/EventsBox";
import { type Meta, type Story } from "@storybook/react";
import * as React from 'react';

const meta: Meta = {
  title: "Containers/Events/EventsBox",
  component: EventsBox,
};

export default meta;

const Template: Story<EventsBoxProps> = (props) => {
  return <EventsBox {...props} />;
};

const EventsBoxExample = Template.bind({});

const args: EventsBoxProps = {
  title: "Last updated events",
  query: { _order: "DESC", _sort: "updatedAt" },
  onEventClick(e) {},
};

EventsBoxExample.args = args;

export { EventsBoxExample as EventsBox };
