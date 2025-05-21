import EventSlimCard, {
  type EventSlimCardProps,
} from "@liexp/ui/lib/components/Cards/Events/EventSlimCard.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Cards/EventSlimCard",
  component: EventSlimCard,
};

export default meta;

const Template: StoryFn<EventSlimCardProps> = (props) => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        events: Q.Event.list.useQuery(
          undefined,
          {
            _order: "DESC",
            _sort: "updatedAt",
            _end: "1",
          },
          false,
        ),
      })}
      render={({
        events: {
          data: [event],
        },
      }) => {
        return <EventSlimCard {...props} event={event} />;
      }}
    />
  );
};

const EventSlimCardExample = Template.bind({});

EventSlimCardExample.args = {
  defaultImage: "",
};

export { EventSlimCardExample };
