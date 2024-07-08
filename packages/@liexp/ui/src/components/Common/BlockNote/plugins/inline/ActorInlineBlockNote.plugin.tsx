import { createReactInlineContentSpec } from "@blocknote/react";
import * as React from "react";
import ActorChipBox from "../../../../../containers/actors/ActorChipBox.js";
import { ActorIcon } from "../../../Icons/FAIcon.js";
import { BlockNoteEditorContext } from "../../BlockNoteEditorContext.js";
import { type BNESchemaEditor } from "../../EditorSchema.js";
import { RelationInlineContentComponent } from "./RelationInlineBlockNote.plugin.js";

export interface ActorInlineState {
  id: string;
  displayAvatar: boolean;
  displayFullName: boolean;
}

// Custom Slash Menu item to insert a block after the current one.
export const actorItem = (editor: BNESchemaEditor) => ({
  title: "Add Actor Inline",
  onItemClick: () => {
    // Inserting the content inline
    editor.insertInlineContent([
      {
        type: "actor",
        props: {
          actor: undefined,
          className: "",
          displayAvatar: true,
          displayFullName: true,
        },
      } as any,
    ]);
  },
  aliases: ["actor", "ac"],
  group: "Relations",
  icon: <ActorIcon />,
  subtext: "Used to insert a block with an actor.",
});

export const actorInlineContentSpec = createReactInlineContentSpec(
  {
    type: "actor",
    propSchema: {
      id: {
        default: "",
      },
      className: {
        default: "",
      },
      displayAvatar: {
        default: true,
      },
      displayFullName: {
        default: true,
      },
    },
    content: "none",
  } as const,
  {
    render: ({
      inlineContent: {
        props: { id, className, displayFullName, displayAvatar },
      },
    }): React.ReactNode => {
      return (
        <BlockNoteEditorContext.Consumer>
          {(editor) =>
            editor ? (
              <RelationInlineContentComponent
                editor={editor}
                relation="actor"
                id={id}
                relationProps={{ displayFullName, id }}
                relationRenderer={{
                  actor: (props) => (
                    <ActorChipBox
                      className={className}
                      style={{ display: "inline-block" }}
                      displayFullName={displayFullName}
                      displayAvatar={displayAvatar}
                      id={props.id}
                      avatarStyle={{
                        display: "inline-block",
                        verticalAlign: "middle",
                      }}
                      onClick={() => {}}
                    />
                  ),
                }}
              />
            ) : null
          }
        </BlockNoteEditorContext.Consumer>
      );
    },
  },
);
