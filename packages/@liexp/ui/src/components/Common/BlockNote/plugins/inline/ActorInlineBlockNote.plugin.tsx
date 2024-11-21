import { createReactInlineContentSpec } from "@blocknote/react";
import {
  type BNESchemaEditor,
  actorInlineSpec,
} from "@liexp/shared/lib/providers/blocknote/index.js";
import * as React from "react";
import ActorChipBox from "../../../../../containers/actors/ActorChipBox.js";
import { ActorIcon } from "../../../Icons/FAIcon.js";
import { BlockNoteEditorContext } from "../../BlockNoteEditorContext.js";
import { RelationInlineContentComponent } from "./RelationInlineBlockNote.plugin.js";

export interface ActorInlineState {
  id: string;
  displayAvatar: boolean;
  displayFullName: boolean;
}

// Custom Slash Menu item to insert a block after the current one.
export const actorItem = (editor: BNESchemaEditor) => ({
  title: "Add Actor Inline",
  key: "actor",
  onItemClick: () => {
    // Inserting the content inline
    editor.insertInlineContent([
      {
        type: "actor",
        props: {
          id: undefined as any,
          className: "",
          displayAvatar: true,
          displayFullName: true,
        },
      },
    ]);
  },
  aliases: ["actor", "ac"],
  group: "Relations",
  icon: <ActorIcon fontSize="small" />,
  subtext: "Used to insert a block with an actor.",
});

export const actorInlineContentSpec = createReactInlineContentSpec(
  actorInlineSpec,
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
