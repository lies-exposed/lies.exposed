import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEvent";
import {
  EventCardGrid,
  type EventCardGridProps,
} from "@liexp/ui/lib/components/Cards/Events/EventCardGrid.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { useAPI } from "@liexp/ui/lib/hooks/useAPI";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Cards/EventCardGrid",
  component: EventCardGrid,
};

export default meta;

const Template: StoryFn<EventCardGridProps<SearchEvent>> = (props) => {
  const api = useAPI();
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
        return <EventCardGrid {...props} events={events} />;
      }}
    />
  );
};

const EventCardGridExample = Template.bind<any>({});

EventCardGridExample.args = {};

export { EventCardGridExample };
