import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import {
  EventTemplateUI,
  type EventTemplateProps,
} from "@liexp/ui/lib/templates/EventTemplate.js";
import { type StoryFn, type Meta } from "@storybook/react-vite";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Event/Page",
  component: EventTemplateUI,
};

export default meta;

const Template: StoryFn<EventTemplateProps & { defaultTab: number }> = ({
  defaultTab,
  ...props
}) => {
  const [tab, setTab] = React.useState(defaultTab);

  return (
    <QueriesRenderer
      queries={(Q) => ({
        events: Q.Event.list.useQuery(
          undefined,
          {
            _end: "10",
          },
          false,
        ),
      })}
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
  defaultTab: 0,
  filters: {
    actors: [],
    groups: [],
    keywords: [],
    eventType: [],
  },
};

export { EventTemplateDefault };
