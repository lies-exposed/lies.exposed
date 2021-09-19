import { firstEventMetadata } from "@econnessione/shared/mock-data/events/events-metadata";
import {
  EventMetadataList,
  EventMetadataListProps,
} from "@econnessione/ui/components/lists/EventMetadataList";
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
