import {
  EventPageContent,
  EventPageContentProps,
} from "@liexp/ui/components/EventPageContent";
import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useEventsQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/EventPageContent",
  component: EventPageContent,
};

export default meta;

const Template: Story<EventPageContentProps> = (props) => {
  return (
    <QueriesRenderer
      loader="fullsize"
      queries={{
        events: useEventsQuery(
          {
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

const EventPageContentExample = Template.bind({});

EventPageContentExample.args = {
  event: undefined,
};

export { EventPageContentExample as EventPageContent };
