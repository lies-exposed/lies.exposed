import {
  EventCardGrid,
  type EventCardGridProps,
} from "@liexp/ui/lib/components/Cards/Events/EventCardGrid.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { useAPI } from "@liexp/ui/lib/hooks/useAPI";
import { searchEventsQuery } from "@liexp/ui/lib/state/queries/SearchEventsQuery.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Cards/EventCardGrid",
  component: EventCardGrid,
};

export default meta;

const Template: StoryFn<EventCardGridProps> = (props) => {
  const api = useAPI();
  return (
    <QueriesRenderer
      queries={(Q) => ({
        events: searchEventsQuery(api)({
          _order: "DESC",
          _sort: "updatedAt",
          _start: 0,
          _end: 3,
          hash: "event-card-grid-stories",
        }),
      })}
      render={({ events: { events } }) => {
        return <EventCardGrid {...props} events={events} />;
      }}
    />
  );
};

const EventCardGridExample = Template.bind({});

EventCardGridExample.args = {};

export { EventCardGridExample };
