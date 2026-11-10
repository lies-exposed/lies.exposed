import { createReactInlineContentSpec } from "@blocknote/react";
import { EventHelper } from "@liexp/shared/lib/helpers/event/event.helper.js";
import {
  DEFAULT_EVENT_INLINE_ID,
  type BNESchemaEditor,
  eventInlineSpec,
} from "@liexp/shared/lib/providers/blocknote/index.js";
import * as React from "react";
import { AutocompleteEventInput } from "../../../../Input/AutocompleteEventInput.js";
import { Chip } from "../../../../mui/index.js";
import { EventIcon } from "../../../Icons/index.js";
import { BlockNoteEditorContext } from "../../BlockNoteEditorContext.js";

// Custom Slash Menu item to insert an event inline.
export const eventInlineItem = (editor: BNESchemaEditor) => ({
  key: "event-inline",
  title: "Add Event Inline",
  onItemClick: () => {
    editor.insertInlineContent([
      {
        type: "event-inline",
        props: {
          id: DEFAULT_EVENT_INLINE_ID,
          title: "",
        },
      },
    ]);
  },
  aliases: ["event", "ev"],
  group: "Events",
  icon: <EventIcon type="Uncategorized" fontSize="small" />,
  subtext: "Used to insert an event reference inline.",
});

const EventInlineContentComponent: React.FC<{
  editor: BNESchemaEditor;
  id?: string;
  title?: string;
}> = ({ editor, id: _id, title: _title }) => {
  const [id, setId] = React.useState<string | undefined>(_id);
  const [title, setTitle] = React.useState<string>(_title ?? "");

  const removeItem = React.useCallback(() => {
    const pos = editor.getTextCursorPosition();
    const blockContent = pos.block.content as any[];
    const updatedBlockContent = blockContent.flatMap((t) =>
      t.type === "event-inline" && t.props.id === id ? [] : [t],
    );
    editor.updateBlock(pos.block, { content: updatedBlockContent });
  }, [editor, id]);

  const updateItem = React.useCallback(
    (newId: string, newTitle: string) => {
      const currentBlock =
        editor.document.find((block) =>
          ((block.content as any[]) ?? []).find(
            (t) =>
              t.type === "event-inline" &&
              (t.props.id === _id || t.props.id === id),
          ),
        ) ?? editor.getTextCursorPosition().block;

      if (currentBlock) {
        const updatedBlockContent = (currentBlock.content as any[]).map((t) =>
          t.type === "event-inline" && (t.props.id === _id || t.props.id === id)
            ? {
                type: "event-inline" as const,
                props: { id: newId, title: newTitle },
              }
            : t,
        );
        editor.updateBlock(currentBlock, { content: updatedBlockContent });
        setId(newId);
        setTitle(newTitle);
      }
    },
    [editor, _id, id],
  );

  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!id || id === DEFAULT_EVENT_INLINE_ID) {
      const timer = setTimeout(() => {
        wrapperRef.current?.querySelector("input")?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [id]);

  if (editor.isEditable) {
    if (!id || id === DEFAULT_EVENT_INLINE_ID) {
      return (
        <div ref={wrapperRef} style={{ display: "inline-flex" }}>
          <AutocompleteEventInput
            style={{ display: "inline-flex", minWidth: 250 }}
            discrete={false}
            selectedItems={[]}
            onChange={(items) => {
              if (items.length > 0) {
                const event = items[0];
                const resolvedTitle = EventHelper.getTitle(event, {
                  actors: [],
                  groups: [],
                  keywords: [],
                  groupsMembers: [],
                  media: [],
                  links: [],
                  areas: [],
                });
                updateItem(event.id, resolvedTitle);
              }
            }}
          />
        </div>
      );
    }

    return (
      <Chip
        size="small"
        label={title || id}
        onDelete={removeItem}
        onClick={() => setId(DEFAULT_EVENT_INLINE_ID)}
        style={{ display: "inline-flex", verticalAlign: "middle" }}
      />
    );
  }

  return (
    <Chip
      size="small"
      label={title || id}
      style={{ display: "inline-flex", verticalAlign: "middle" }}
    />
  );
};

export const eventInlineContentSpec = createReactInlineContentSpec(
  eventInlineSpec,
  {
    render: ({
      inlineContent: {
        props: { id, title } = { id: undefined, title: undefined },
      },
    }): React.ReactNode => {
      return (
        <BlockNoteEditorContext.Consumer>
          {(editor) =>
            editor ? (
              <EventInlineContentComponent
                editor={editor}
                id={id}
                title={title}
              />
            ) : null
          }
        </BlockNoteEditorContext.Consumer>
      );
    },
  },
);
