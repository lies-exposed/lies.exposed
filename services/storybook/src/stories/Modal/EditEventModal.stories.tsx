import { getTitle } from "@liexp/shared/lib/helpers/event/index.js";
import { fromSearchEvent } from "@liexp/shared/lib/helpers/event/search-event";
import {
  EventSuggestionCreate,
  EventSuggestionEdit,
} from "@liexp/shared/lib/io/http/User.js";
import EditEventButton from "@liexp/ui/lib/components/Common/Button/EditEventButton.js";
import {
  EditEventModal,
  type EditEventModalProps,
} from "@liexp/ui/lib/components/Modal/EditEventModal.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { Button, Box } from "@liexp/ui/lib/components/mui/index.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta<EditEventModalProps> = {
  title: "Components/Modal/EditEventModal",
  component: EditEventModal,
  argTypes: {},
};

export default meta;

const Template: StoryFn<EditEventModalProps> = ({ ...props }) => {
  const [{ start, end }, setStartEnd] = React.useState({
    start: 0,
    end: 1,
  });

  const doRefreshStartEnd = (): void => {
    const start = Math.floor(Math.random() * 100);
    setStartEnd({
      start,
      end: start + 1,
    });
  };

  React.useEffect(() => {
    localStorage.setItem("auth", "nice-auth-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        permissions: [EventSuggestionCreate.Type, EventSuggestionEdit.Type],
      }),
    );
  }, []);

  return (
    <QueriesRenderer
      queries={(Q) => ({
        events: Q.Event.Custom.SearchEvents.useQuery(undefined, {
          _start: start.toString(),
          _end: end.toString(),
        }),
      })}
      render={({
        events: {
          data: { events, ...relations },
        },
      }) => {
        const e = events[0];
        return (
          <Box>
            <Button
              onClick={() => {
                doRefreshStartEnd();
              }}
            >
              Pick another event
            </Button>
            Open {getTitle(fromSearchEvent(e), { ...relations, areas: [] })}:{" "}
            <EditEventButton id={e.id} />
          </Box>
        );
      }}
    />
  );
};

const ExampleEditEventModal = Template.bind({});

ExampleEditEventModal.args = {};

export { ExampleEditEventModal };
