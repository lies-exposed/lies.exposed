import { Quote } from "@liexp/shared/io/http/Events";
import {
  EventPageContent,
  type EventPageContentProps,
} from "@liexp/ui/components/EventPageContent";
import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useEventsQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { type Meta, type Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/EventPageContent",
  component: EventPageContent,
};

export default meta;

const Template: Story<{ type: string } & EventPageContentProps> = ({
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
            <EventPageContent {...props} event={events.data[0]} />
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
