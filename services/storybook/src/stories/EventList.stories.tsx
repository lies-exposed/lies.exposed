import EventsBox, {
  EventsBoxProps
} from "@liexp/ui/components/containers/EventsBox";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from 'react';

const meta: Meta = {
  title: "Components/containers/Events/EventsBox",
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
