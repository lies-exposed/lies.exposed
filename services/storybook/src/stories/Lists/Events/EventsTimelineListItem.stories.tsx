import {
  EventType,
  EventTypes,
} from "@liexp/shared/lib/io/http/Events/index.js";
import { Loader } from "@liexp/ui/lib/components/Common/Loader.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import EventTimelineItem, {
  type EventTimelineItemProps,
} from "@liexp/ui/lib/components/lists/EventList/EventTimelineItem.js";
import { useAPI } from "@liexp/ui/lib/hooks/useAPI";
import { searchEventsQuery } from "@liexp/ui/lib/state/queries/SearchEventsQuery.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Lists/Events/EventTimelineListItem",
  component: EventTimelineItem,
  argTypes: {
    type: {
      control: { type: "select", options: EventType.types.map((t) => t.value) },
    },
  },
};

export default meta;

interface EventTimelineItemStoryProps extends EventTimelineItemProps {
  type: EventType;
}

const Template: StoryFn<EventTimelineItemStoryProps> = ({ type, ...props }) => {
  const api = useAPI();
  return (
    <div style={{ height: "100%" }}>
      <QueriesRenderer
        queries={{
          events: searchEventsQuery(api)({
            hash: "events-timeline-list-item-storybook",
            eventType: [type],
            _start: 0,
            _end: 1,
          }),
        }}
        render={({ events }) => {
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
  type: EventTypes.DEATH.value,
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
  type: EventTypes.QUOTE.value,
  isLast: false,
};

export { DeathEventTimelineListItem, QuoteEventTimelineListItem };
