import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import { useEventsQuery } from "@liexp/ui/lib/state/queries/DiscreteQueries";
import {
  EventTemplateUI,
  type EventTemplateProps,
} from "@liexp/ui/lib/templates/EventTemplate";
import { type Meta, type Story } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Event/Page",
  component: EventTemplateUI,
};

export default meta;

const Template: Story<EventTemplateProps & { defaultTab: number }> = ({
  defaultTab,
  ...props
}) => {
  const [tab, setTab] = React.useState(defaultTab);

  return (
    <QueriesRenderer
      queries={{
        events: useEventsQuery(
          {
            pagination: { perPage: 10, page: 1 },
            filter: {},
          },
          false
        ),
      }}
      render={({ events: { data } }) => {
        return (
          <EventTemplateUI
            {...props}
            event={data[0]}
            tab={tab}
            onTabChange={setTab}
          />
        );
      }}
    />
  );
};

const EventTemplateDefault = Template.bind({});

EventTemplateDefault.args = {
  defaultTab: 1,
};

export { EventTemplateDefault };
