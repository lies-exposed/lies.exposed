import {
  ActorArb,
  GroupArb,
  MediaArb,
  UncategorizedArb
} from "@liexp/shared/tests";
import { KeywordArb } from "@liexp/shared/tests/arbitrary/Keyword.arbitrary";
import { fc } from "@liexp/test";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import EventsTimelineList, {
  EventsTimelineListProps
} from "@liexp/ui/components/lists/EventList/EventsTimelineList";
import {
  searchEventsQuery
} from "@liexp/ui/state/queries/SearchEventsQuery";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Lists/Events/EventTimelineList",
  component: EventsTimelineList,
};

export default meta;

const Template: Story<EventsTimelineListProps> = (props) => {
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
          return <EventsTimelineList {...props} events={events} ref={ref} />;
        }}
      />
    </div>
  );
};

const EventsTimelineListExample = Template.bind({});

const args: Omit<EventsTimelineListProps, "ref"> = {
  defaultHeight: 600,
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
    })),
    actors: [],
    groups: [],
    media: [],
    keywords: [],
    groupsMembers: [],
    totals: {
      uncategorized: 10,
      deaths: 0,
      scientificStudies: 0,
      patents: 0,
      documentaries: 0,
      transactions: 0,
      quotes: 0,
    },
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

EventsTimelineListExample.args = args;

export { EventsTimelineListExample as EventsTimelineList };
