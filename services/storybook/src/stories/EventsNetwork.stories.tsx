import { Events } from "@liexp/shared/io/http";
import { actors } from "@liexp/shared/mock-data/actors";
import { events } from "@liexp/shared/mock-data/events";
import { groups } from "@liexp/shared/mock-data/groups";
import {
  EventsNetworkGraph,
  EventsNetworkGraphProps,
} from "@liexp/ui/components/Graph/EventsNetworkGraph";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
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
    body: {},
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
  events: uncategorizedEvents as any[],
  includeEmptyRelations: false,
  actors,
  groups,
  keywords: [],
  selectedActorIds: actors.map((a) => a.id),
  selectedGroupIds: [],
  selectedKeywordIds: [],
  onEventClick: () => {},
};

NetworkGraphExample.args = args;

NetworkGraphExample.argTypes = {};

export { NetworkGraphExample };
