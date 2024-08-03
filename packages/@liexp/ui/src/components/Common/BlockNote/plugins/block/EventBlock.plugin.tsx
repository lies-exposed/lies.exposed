import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { type Events } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import EventsBox from "../../../../../containers/EventsBox.js";
import { AutocompleteEventInput } from "../../../../Input/AutocompleteEventInput.js";
import { Box, IconButton, Icons, Stack } from "../../../../mui/index.js";
import { EventIcon } from "../../../Icons/index.js";
import { type BNESchemaEditor } from "../../EditorSchema.js";
import { EditMenu } from "../EditMenu/EditMenu.js";

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
  icon: <EventIcon type="Uncategorized" fontSize="small" />,
});

export const EventBlockPluginControl: React.FC<{
  data: { events: Events.Event[] };
  onChange: (id: string) => void;
  onRemove: () => void;
}> = ({ data, onChange, onRemove: remove, ...props }) => {
  return (
    <Stack
      style={{ height: 350 }}
      direction={"row"}
      alignItems={"center"}
      justifyItems={"flex-start"}
    >
      <Box display={"flex"} style={{ width: 600 }}>
        <AutocompleteEventInput
          style={{ width: "100%" }}
          discrete={false}
          selectedItems={data.events}
          onChange={(items) => {
            if (items.length > 0) {
              onChange(items[0].id);
            }
          }}
        />
      </Box>

      <IconButton
        size="small"
        onClick={() => {
          remove?.();
        }}
      >
        <Icons.Cancel style={{ fontSize: 9 }} />
      </IconButton>
    </Stack>
  );
};

export const EventBlockPluginRenderer: React.FC<{ id: string }> = ({ id }) => {
  return (
    <Box display="flex" style={{ maxWidth: 1200, flexGrow: 0, margin: 0 }}>
      <EventsBox
        query={{ ids: [id] }}
        onEventClick={() => {}}
        cardLayout="horizontal"
      />
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
    render: ({
      block: {
        id: blockId,
        props: { id },
      },
      editor,
    }): React.ReactNode => {
      const currentCursor = editor.getTextCursorPosition();

      const onRemove = () => {
        editor.removeBlocks([currentCursor.block]);
      };

      const onChange = (newId: string): void => {
        const pos = editor.getBlock(blockId);
        if (pos) {
          editor.updateBlock(pos, {
            ...pos,
            props: {
              ...pos.props,
              id: newId,
            },
          });
        } else {
          insertOrUpdateBlock(editor, {
            type: "event",
            props: {
              id: newId,
            },
          });
        }
      };

      return (
        <EditMenu
          editor={editor as any}
          onClick={() => {
            onChange("");
          }}
        >
          {id === "" ? (
            <EventBlockPluginControl
              onRemove={onRemove}
              data={{ events: [] }}
              onChange={onChange}
            />
          ) : (
            <EventBlockPluginRenderer id={id} />
          )}
        </EditMenu>
      );
    },
  },
);
