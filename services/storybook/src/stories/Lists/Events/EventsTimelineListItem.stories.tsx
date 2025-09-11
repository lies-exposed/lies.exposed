import {
  EventType,
  EventTypes,
  EVENT_TYPES,
} from "@liexp/shared/lib/io/http/Events/EventType.js";
import { Loader } from "@liexp/ui/lib/components/Common/Loader.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import EventTimelineItem, {
  type EventTimelineItemProps,
} from "@liexp/ui/lib/components/lists/EventList/EventTimelineItem.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import * as React from "react";

const meta: Meta = {
  title: "Components/Lists/Events/EventTimelineListItem",
  component: EventTimelineItem,
  argTypes: {
    type: {
      control: {
        type: "select",
        options: EventType.members.map((t) => t.literals[0]),
      },
    },
  },
};

export default meta;

interface EventTimelineItemStoryProps extends EventTimelineItemProps {
  type: EventType;
}

const Template: StoryFn<EventTimelineItemStoryProps> = ({ type, ...props }) => {
  return (
    <div style={{ height: "100%" }}>
      <QueriesRenderer
        queries={(Q) => ({
          events: Q.Event.Custom.SearchEvents.useQuery(undefined, {
            eventType: [type],
            _start: "0",
            _end: "1",
          }),
        })}
        render={({ events: { data: events } }) => {
          if (events.events[0]) {
            return <EventTimelineItem {...props} event={events.events[0]} />;
          }
          return <Loader />;
        }}
      />
    </div>
  );
};

const DeathEventTimelineListItem = Template.bind({});

DeathEventTimelineListItem.args = {
  type: EVENT_TYPES.DEATH,
  isLast: false,
  onActorClick: () => {},
  onGroupClick() {},
  onKeywordClick() {},
  onGroupMemberClick() {},
  onClick() {},
  onRowInvalidate() {},
  onLoad: () => {},
};

const QuoteEventTimelineListItem = Template.bind({});
QuoteEventTimelineListItem.args = {
  type: EVENT_TYPES.QUOTE,
  isLast: false,
};

export { DeathEventTimelineListItem, QuoteEventTimelineListItem };
