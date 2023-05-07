import { Events } from "@liexp/shared/lib/io/http";
import {
  EventsSankeyGraph,
  type EventsSankeyGraphProps,
} from "@liexp/ui/lib/components/Graph/EventsSankeyGraph";
import { type Meta, type StoryFn } from "@storybook/react";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/EventsSankeyGraph",
  component: EventsSankeyGraph,
};

export default meta;

const uncategorizedEvents: Events.Uncategorized.Uncategorized[] = pipe(
  [],
  A.filter(Events.Uncategorized.Uncategorized.is),
  A.mapWithIndex((index, e) => ({
    ...e,
    title: `Event ${index}`,
    body: {},
    tableOfContents: O.some({ items: [] }),
    timeToRead: O.some(1),
    actors: [],
    groups: [],
  }))
);

const Template: StoryFn<EventsSankeyGraphProps> = (props) => {
  return (
    <div>
      <div>
        <EventsSankeyGraph {...props} />
      </div>
    </div>
  );
};

const NetworkGraphExample = Template.bind({});

const args: EventsSankeyGraphProps = {
  scale: "all" as "all",
  groupBy: "group",
  scalePoint: O.none,
  events: uncategorizedEvents as any[],
  includeEmptyRelations: false,
  actors: [],
  groups: [],
  keywords: [],
  selectedActorIds: [],
  selectedGroupIds: [],
  selectedKeywordIds: [],
  onEventClick: () => {},
};

NetworkGraphExample.args = args;

NetworkGraphExample.argTypes = {};

export { NetworkGraphExample };
