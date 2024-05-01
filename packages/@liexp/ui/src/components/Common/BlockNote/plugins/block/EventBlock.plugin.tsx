import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Events } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import EventsBox from "../../../../../containers/EventsBox.js";
import { AutocompleteEventInput } from "../../../../Input/AutocompleteEventInput.js";
import { Box, Grid, IconButton, Icons, Stack } from "../../../../mui/index.js";
import { EventIcon } from "../../../Icons/index.js";
import { BNESchemaEditor } from "../../EditorSchema.js";

// Slash menu item to insert an Event block
export const insertEvent = (editor: BNESchemaEditor) => ({
  title: "Event",
  subtext: "Insert an event block",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      type: "event",
      props: {
        id: "",
      },
    });
  },
  aliases: ["event", "book", "study"],
  group: "Events",
  icon: <EventIcon type="Uncategorized" />,
});

export const EventBlockPluginControl: React.FC<{
  data: { events: Events.Event[] };
  onChange: (id: string) => void;
  onRemove: () => void;
}> = ({ data, onChange, onRemove: remove, ...props }) => {
  return (
    <Box style={{ height: 150 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <AutocompleteEventInput
            discrete={false}
            selectedItems={data.events}
            onChange={(items) => {
              if (items.length > 0) {
                onChange(items[0].id);
              }
            }}
          />
        </Grid>
        <Grid item sm={12}>
          <IconButton
            onClick={() => {
              remove?.();
            }}
          >
            <Icons.Close />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export const EventBlockPluginRenderer: React.FC<{ id: string }> = ({ id }) => {
  return (
    <Box style={{ maxWidth: 1200, flexGrow: 0 }}>
      <EventsBox title="" query={{ ids: [id] }} onEventClick={() => {}} />
    </Box>
  );
};

export const eventBlock = createReactBlockSpec(
  {
    type: "event",
    propSchema: {
      id: {
        default: "",
      },
    },
    content: "inline",
  },
  {
    render: ({ block: { id }, editor }): React.ReactNode => {
      const currentCursor = editor.getTextCursorPosition();

      const onRemove = () => {
        editor.removeBlocks([currentCursor.block]);
      };

      const onChange = (id: string): void => {
        insertOrUpdateBlock(editor, {
          type: "event",
          props: {
            id: id,
          },
        });
      };

      return (
        <Stack direction="column">
          {id === "" ? (
            <EventBlockPluginControl
              onRemove={onRemove}
              data={{ events: [] }}
              onChange={onChange}
            />
          ) : (
            <EventBlockPluginRenderer id={id} />
          )}
        </Stack>
      );
    },
  },
);
