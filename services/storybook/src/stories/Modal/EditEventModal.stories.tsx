import { getTitle } from "@liexp/shared/lib/helpers/event/index.js";
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
import { searchEventsQuery } from "@liexp/ui/lib/state/queries/SearchEventsQuery.js";
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
        permissions: [EventSuggestionCreate.value, EventSuggestionEdit.value],
      }),
    );
  }, []);

  return (
    <QueriesRenderer
      queries={{
        events: searchEventsQuery({
          hash: `edit-event-modal-story-${start}-${end}`,
          _start: start,
          _end: end,
        }),
      }}
      render={({ events: { events, ...relations } }) => {
        const e: any = events[0];
        return (
          <Box>
            <Button
              onClick={() => {
                doRefreshStartEnd();
              }}
            >
              Pick another event
            </Button>
            Open {getTitle(e, { ...relations, areas: [] })}:{" "}
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
