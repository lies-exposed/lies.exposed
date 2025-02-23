import { EventTotalsMonoid } from "@liexp/shared/lib/io/http/Events/EventTotals.js";
import { subYears } from "@liexp/shared/lib/utils/date.utils";
import { fc } from "@liexp/test";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { KeywordArb } from "@liexp/test/lib/arbitrary/Keyword.arbitrary.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import EventsTimelineList, {
  type EventsTimelineListProps,
} from "@liexp/ui/lib/components/lists/EventList/EventsTimelineList.js";
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
        queries={(Q) => ({
          events: Q.Event.Custom.SearchEvents.useQuery(undefined, {
            _start: "0",
            _end: "100",
          }),
        })}
        render={({ events: { data: events } }) => {
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
        actors: fc.sample(ActorArb, 5).map((a) => ({
          ...a,
          bornOn: a.bornOn ? new Date(a.bornOn) : undefined,
        })),
        groups: fc.sample(GroupArb, 5),
        groupsMembers: [],
      },
      links: [],
      socialPosts: [],
      media: fc.sample(MediaArb, 4),
      keywords: fc.sample(KeywordArb, 20),
    })),
    actors: [],
    groups: [],
    media: [],
    keywords: [],
    groupsMembers: [],
    firstDate: subYears(new Date(), 5).toISOString(),
    lastDate: new Date().toISOString(),
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
