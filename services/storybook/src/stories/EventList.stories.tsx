import EventList, {
  EventListProps,
} from "@econnessione/shared/components/lists/EventList/EventList";
import { Events } from "@econnessione/shared/io/http";
import { events } from "@econnessione/shared/mock-data/events";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

const meta: Meta = {
  title: "Components/Lists/EventList",
  component: EventList,
};

export default meta;

const Template: Story<EventListProps> = (props) => {
  return <EventList {...props} />;
};

const EventListExample = Template.bind({});

const args: EventListProps = {
  events: pipe(
    events,
    A.filter(Events.Uncategorized.Uncategorized.is),
    A.map((f) => ({
      ...f,
      // tableOfContents: O.none,
      // timeToRead: O.none,
    }))
  ),
  actors: [],
  groups: [],
};

EventListExample.args = args;

export { EventListExample as EventList };
