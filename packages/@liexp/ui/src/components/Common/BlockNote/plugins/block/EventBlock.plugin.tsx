import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { EventTypes } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { type Events } from "@liexp/shared/lib/io/http/index.js";
import {
  eventBlockSpecs,
  type BNESchemaEditor,
} from "@liexp/shared/lib/providers/blocknote/index.js";
import * as React from "react";
import EventsBox from "../../../../../containers/EventsBox.js";
import { AutocompleteEventInput } from "../../../../Input/AutocompleteEventInput.js";
import { Box, IconButton, Icons, Stack } from "../../../../mui/index.js";
import { EventIcon } from "../../../Icons/index.js";
import { EditMenu } from "../EditMenu/EditMenu.js";

const DEFAULT_ID = "missing-id";
const DEFAULT_TYPE = "missing-type";

interface InsertEventBlockProps {
  title: string;
  type: EventType;
}
// Slash menu item to insert an Event block
const insertEventBlock =
  ({ title, type }: InsertEventBlockProps) =>
  (editor: BNESchemaEditor) => ({
    title,
    subtext: "Insert an event block",
    onItemClick: () => {
      insertOrUpdateBlock(editor, {
        type: "event",
        id: uuid(),
        props: {
          id: DEFAULT_ID,
          type,
        },
      });
    },
    aliases: [type, "event"].map((v) => v.toLowerCase()),
    group: "Events",
    icon: <EventIcon type={type} fontSize="small" />,
  });

export const insertBookEventBlock = insertEventBlock({
  title: "Book",
  type: EventTypes.BOOK.Type,
});

export const insertDeathEventBlock = insertEventBlock({
  title: "Death",
  type: EventTypes.DEATH.Type,
});

export const insertDocumentaryEventBlock = insertEventBlock({
  title: "Documentary",
  type: EventTypes.DOCUMENTARY.Type,
});

export const insertPatentEventBlock = insertEventBlock({
  title: "Event",
  type: EventTypes.PATENT.Type,
});

export const insertQuoteEventBlock = insertEventBlock({
  title: "Quote",
  type: EventTypes.QUOTE.Type,
});

export const insertScientificStudyEventBlock = insertEventBlock({
  title: "Scientific",
  type: EventTypes.SCIENTIFIC_STUDY.Type,
});

export const insertTransactionEventBlock = insertEventBlock({
  title: "Transaction",
  type: EventTypes.TRANSACTION.Type,
});

export const insertUncategorizedEventBlock = insertEventBlock({
  title: "Uncategorized",
  type: EventTypes.UNCATEGORIZED.Type,
});

export const EventBlockPluginControl: React.FC<{
  data: { events: Events.Event[] };
  type?: EventType;
  onChange: (id: string) => void;
  onRemove: () => void;
}> = ({ data, onChange, onRemove: remove, type, ...props }) => {
  return (
    <Stack
      style={{ height: 200 }}
      direction={"row"}
      alignItems={"center"}
      justifyItems={"flex-start"}
    >
      <Box display={"flex"} style={{ width: 600 }}>
        <AutocompleteEventInput
          style={{ width: "100%" }}
          discrete={false}
          selectedItems={data.events}
          filter={{ eventType: type ? [type] : undefined }}
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

export const eventBlock = createReactBlockSpec(eventBlockSpecs, {
  render: ({
    block: {
      id: blockId,
      props: { id, type },
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
      }
    };

    return (
      <EditMenu
        editor={editor as any}
        onClick={() => {
          onChange(DEFAULT_ID);
        }}
      >
        {id === DEFAULT_ID ? (
          <EventBlockPluginControl
            onRemove={onRemove}
            data={{ events: [] }}
            onChange={onChange}
            type={type === DEFAULT_TYPE ? undefined : (type as EventType)}
          />
        ) : (
          <EventBlockPluginRenderer id={id} />
        )}
      </EditMenu>
    );
  },
});
