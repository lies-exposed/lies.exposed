import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event";
import {
  type EventType,
  EventTypes,
} from "@liexp/shared/lib/io/http/Events/EventType";
import {
  EventPageContent,
  type EventPageContentProps,
} from "@liexp/ui/lib/components/EventPageContent";
import { MainContent } from "@liexp/ui/lib/components/MainContent";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import { type Meta, type StoryFn } from "@storybook/react";
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
          {
            filter: { eventType: type },
            pagination: {
              perPage: 1,
              page: 1,
            },
            sort: {
              field: "updatedAt",
              order: "DESC",
            },
          },
          undefined,
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
  type: EventTypes.QUOTE.value,
};

export { DefaultEventPageContent, QuoteEventPageContent };
