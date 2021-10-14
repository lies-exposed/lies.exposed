import { Events } from "@econnessione/shared/io/http";
import { actors } from "@econnessione/shared/mock-data/actors";
import { events } from "@econnessione/shared/mock-data/events";
import { groups } from "@econnessione/shared/mock-data/groups";
import {
  EventsNetworkGraph,
  EventsNetworkGraphProps,
} from "@econnessione/ui/components/Graph/EventsNetworkGraph";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/EventsNetworkGraph",
  component: EventsNetworkGraph,
};

export default meta;

const uncategorizedEvents: Events.Uncategorized.Uncategorized[] = pipe(
  events,
  A.filter(Events.Uncategorized.Uncategorized.is),
  A.mapWithIndex((index, e) => ({
    ...e,
    title: `Event ${index}`,
    body: "",
    tableOfContents: O.some({ items: [] }),
    timeToRead: O.some(1),
    actors: actors.map((a) => a.id),
    groups: groups.map((g) => g.id),
  }))
);

const Template: Story<EventsNetworkGraphProps> = (props) => {
  return (
    <div>
      <div>
        <EventsNetworkGraph {...props} />
      </div>
    </div>
  );
};

const NetworkGraphExample = Template.bind({});

const args: EventsNetworkGraphProps = {
  scale: "all" as "all",
  groupBy: "group",
  scalePoint: O.none,
  events: uncategorizedEvents,
  actors,
  groups,
  keywords: [],
  selectedActorIds: actors.map((a) => a.id),
  selectedGroupIds: [],
  selectedKeywordIds: [],
  onEventClick: () => {},
};

NetworkGraphExample.args = args;

NetworkGraphExample.argTypes = {
  minDate: { control: "date" },
  maxDate: { control: "date" },
  selectedEvents: { control: "object" },
};

export { NetworkGraphExample };
