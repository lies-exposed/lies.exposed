import { getTitle } from "@liexp/shared/helpers/event";
import {
  EventSuggestionCreate,
  EventSuggestionEdit,
} from "@liexp/shared/io/http/User";
import EditEventButton from "@liexp/ui/components/Common/Button/EditEventButton";
import { MainContent } from "@liexp/ui/components/MainContent";
import {
  EditEventModal,
  type EditEventModalProps,
} from "@liexp/ui/components/Modal/EditEventModal";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { searchEventsQuery } from "@liexp/ui/state/queries/SearchEventsQuery";
import { Button } from "@mui/material";
import { Box } from "@mui/system";
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
      })
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
            Open {getTitle(e, relations)}: <EditEventButton id={e.id} />
          </Box>
        );
      }}
    />
  );
};

const ExampleEditEventModal = Template.bind({});

ExampleEditEventModal.args = {};

export { ExampleEditEventModal };
