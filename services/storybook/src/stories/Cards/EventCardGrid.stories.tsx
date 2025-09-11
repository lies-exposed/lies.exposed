import {
  EventCardGrid,
  type EventCardGridProps,
} from "@liexp/ui/lib/components/Cards/Events/EventCardGrid.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import * as React from "react";

const meta: Meta = {
  title: "Components/Cards/EventCardGrid",
  component: EventCardGrid,
};

export default meta;

const Template: StoryFn<EventCardGridProps> = (props) => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        events: Q.Event.Custom.SearchEvents.useQuery(undefined, {
          _order: "DESC",
          _sort: "updatedAt",
          _start: "0",
          _end: "3",
        }),
      })}
      render={({
        events: {
          data: { events },
        },
      }) => {
        return <EventCardGrid {...props} events={[...events]} />;
      }}
    />
  );
};

const EventCardGridExample = Template.bind({});

EventCardGridExample.args = {};

export { EventCardGridExample };
