import { fc } from "@liexp/core/tests";
import {
  ActorArb,
  GroupArb,
  MediaArb,
  UncategorizedArb,
} from "@liexp/shared/tests";
import { KeywordArb } from "@liexp/shared/tests/arbitrary/Keyword.arbitrary";
import EventsTimelineList, {
  EventsTimelineListProps,
} from "@liexp/ui/components/lists/EventList/EventsTimelineList";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Lists/Events/EventTimelineList",
  component: EventsTimelineList,
};

export default meta;

const Template: Story<EventsTimelineListProps> = (props) => {
  // eslint-disable-next-line react/display-name
  const ref = React.forwardRef((_node, ref) => {
    return <div ref={() => ref}>Hello</div>;
  });

  return <EventsTimelineList {...props} ref={ref} />;
};

const EventsTimelineListExample = Template.bind({});

const args: Omit<EventsTimelineListProps, "ref"> = {
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
