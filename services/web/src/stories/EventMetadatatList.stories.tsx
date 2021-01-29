import {
  EventMetadataList,
  EventMetadataListProps,
} from "@components/lists/EventMetadataList";
import { firstEventMetadata } from "@mock-data/events/events-metadata";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Lists/EventMetadataList",
  component: EventMetadataList,
};

export default meta;

const Template: Story<EventMetadataListProps> = (props) => {
  return <EventMetadataList {...props} />;
};

const EventMetadataListExample = Template.bind({});

const args: EventMetadataListProps = {
  metadata: firstEventMetadata,
};

EventMetadataListExample.args = args;

export { EventMetadataListExample as EventMetadataList };
