import { EventTotalsMonoid } from "@liexp/shared/lib/io/http/Events/EventTotals";
import { KeywordArb } from "@liexp/shared/lib/tests/arbitrary/Keyword.arbitrary.js";
import {
  ActorArb,
  GroupArb,
  MediaArb,
  UncategorizedArb,
} from "@liexp/shared/lib/tests/index.js";
import { fc } from "@liexp/test";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import EventsTimelineList, {
  type EventsTimelineListProps,
} from "@liexp/ui/lib/components/lists/EventList/EventsTimelineList";
import { searchEventsQuery } from "@liexp/ui/lib/state/queries/SearchEventsQuery";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";
import { AutoSizer } from "react-virtualized";

const meta: Meta = {
  title: "Components/Lists/Events/EventTimelineList",
  component: EventsTimelineList,
};

export default meta;

const Template: StoryFn<EventsTimelineListProps> = (props) => {
  const ref = React.createRef();

  return (
    <div style={{ height: "100%" }}>
      <QueriesRenderer
        queries={{
          events: searchEventsQuery({
            hash: "events-timeline-storybook",
            _start: 0,
            _end: 100,
          }),
        }}
        render={({ events }) => {
          return (
            <AutoSizer>
              {({ width, height }) => {
                return (
                  <EventsTimelineList
                    {...props}
                    width={width}
                    height={height}
                    events={events}
                    ref={ref}
                  />
                );
              }}
            </AutoSizer>
          );
        }}
      />
    </div>
  );
};

const EventsTimelineListExample = Template.bind({});

EventsTimelineListExample.args = {
  events: {
    events: fc.sample(UncategorizedArb, 10).map((u) => ({
      ...u,
      payload: {
        ...u.payload,
        actors: fc.sample(ActorArb, 5),
        groups: fc.sample(GroupArb, 5),
        groupsMembers: [],
      },
      media: fc.sample(MediaArb, 4),
      keywords: fc.sample(KeywordArb, 20),
      links: [],
    })),
    actors: [],
    groups: [],
    media: [],
    keywords: [],
    groupsMembers: [],
    links: [],
    totals: EventTotalsMonoid.empty,
    total: 10,
  },
  total: 10,
  onActorClick: () => {},
  onGroupClick(g) {},
  onKeywordClick(k) {},
  onGroupMemberClick() {},
  onClick(e) {},
  onRowsRendered(info) {},
};

export { EventsTimelineListExample as EventsTimelineList };
