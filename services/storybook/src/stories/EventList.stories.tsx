import { fc } from "@liexp/core/tests";
import { Events } from "@liexp/shared/io/http";
import { events } from "@liexp/shared/mock-data/events";
import {
  ActorArb,
  GroupArb,
  MediaArb,
  UncategorizedArb,
} from "@liexp/shared/tests";
import { KeywordArb } from "@liexp/shared/tests/arbitrary/Keyword.arbitrary";
import EventList, {
  EventListProps,
} from "@liexp/ui/components/lists/EventList/EventList";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";

const meta: Meta = {
  title: "Components/Lists/Events/EventList",
  component: EventList,
};

export default meta;

const Template: Story<EventListProps> = (props) => {
  return <EventList {...props} />;
};

const EventListExample = Template.bind({});

const args: EventListProps = {
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
  onActorClick: () => {},
  onGroupClick(g) {},
  onKeywordClick(k) {},
  onGroupMemberClick() {},
  onRowInvalidate(e) {},
  onClick(e) {},
};

EventListExample.args = args;

export { EventListExample as EventList };
