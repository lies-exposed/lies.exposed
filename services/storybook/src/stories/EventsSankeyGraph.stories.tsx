import { Events } from "@liexp/shared/lib/io/http/index.js";
import {
  EventsSankeyGraph,
  type EventsSankeyGraphProps,
} from "@liexp/ui/lib/components/Graph/EventsSankeyGraph.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as A from "fp-ts/lib/Array.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
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
  })),
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
