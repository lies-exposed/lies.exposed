import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event.js";
import {
  type EventType,
  EVENT_TYPES,
} from "@liexp/shared/lib/io/http/Events/EventType.js";
import {
  EventPageContent,
  type EventPageContentProps,
} from "@liexp/ui/lib/components/EventPageContent.js";
import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/EventPageContent",
  component: EventPageContent,
};

export default meta;

const Template: StoryFn<{ type: EventType } & EventPageContentProps> = ({
  type,
  ...props
}) => {
  return (
    <QueriesRenderer
      loader="fullsize"
      queries={(Q) => ({
        events: Q.Event.list.useQuery(
          undefined,
          {
            eventType: [type],
            _end: "1",
            _sort: "updatedAt",
            _order: "DESC",
          },

          false,
        ),
      })}
      render={({ events }) => {
        return (
          <MainContent>
            <EventPageContent
              {...props}
              event={toSearchEvent(events.data[0], {})}
            />
          </MainContent>
        );
      }}
    />
  );
};

const DefaultEventPageContent = Template.bind({});

DefaultEventPageContent.args = {
  event: undefined,
};

const QuoteEventPageContent = Template.bind({});
QuoteEventPageContent.args = {
  type: EVENT_TYPES.QUOTE,
};

export { DefaultEventPageContent, QuoteEventPageContent };
