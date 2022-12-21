import { Death, EventType, Quote } from "@liexp/shared/io/http/Events";
import { Loader } from "@liexp/ui/components/Common/Loader";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import EventTimelineItem, {
  EventTimelineItemProps,
} from "@liexp/ui/components/lists/EventList/EventTimelineItem";
import { searchEventsQuery } from "@liexp/ui/state/queries/SearchEventsQuery";
import { Meta, Story } from "@storybook/react/types-6-0";
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

const Template: Story<EventTimelineItemStoryProps> = ({ type, ...props }) => {
  return (
    <div style={{ height: "100%" }}>
      <QueriesRenderer
        queries={{
          events: searchEventsQuery({
            hash: "events-timeline-list-item-storybook",
            type: [type],
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
  type: Death.DEATH.value,
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
  type: Quote.QUOTE.value,
  isLast: false,
};

export { DeathEventTimelineListItem, QuoteEventTimelineListItem };
