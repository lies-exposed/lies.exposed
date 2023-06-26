import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event";
import { Quote } from "@liexp/shared/lib/io/http/Events";
import {
  EventPageContent,
  type EventPageContentProps,
} from "@liexp/ui/lib/components/EventPageContent";
import { MainContent } from "@liexp/ui/lib/components/MainContent";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import { useEventsQuery } from "@liexp/ui/lib/state/queries/event.queries";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/EventPageContent",
  component: EventPageContent,
};

export default meta;

const Template: StoryFn<{ type: string } & EventPageContentProps> = ({
  type,
  ...props
}) => {
  return (
    <QueriesRenderer
      loader="fullsize"
      queries={{
        events: useEventsQuery(
          {
            filter: { type },
            pagination: {
              perPage: 1,
              page: 1,
            },
            sort: {
              field: "updatedAt",
              order: "DESC",
            },
          },
          false
        ),
      }}
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
  type: Quote.QUOTE.value,
};

export { DefaultEventPageContent, QuoteEventPageContent };
