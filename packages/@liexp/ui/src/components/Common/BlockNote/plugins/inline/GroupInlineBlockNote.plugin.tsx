import { createReactInlineContentSpec } from "@blocknote/react";
import * as React from "react";
import GroupChipBox from "../../../../../containers/groups/GroupChipBox.js";
import { GroupIcon } from "../../../Icons/FAIcon.js";
import { BlockNoteEditorContext } from "../../BlockNoteEditorContext.js";
import { type BNESchemaEditor } from "../../EditorSchema.js";
import { RelationInlineContentComponent } from "./RelationInlineBlockNote.plugin.js";

export interface GroupInlineState {
  id: string;
}

// Custom Slash Menu item to insert a block after the current one.
export const groupItem = (editor: BNESchemaEditor) => ({
  title: "Add Group Inline",
  onItemClick: () => {
    // Inserting the content inline
    editor.insertInlineContent([
      {
        type: "group",
        props: {
          id: undefined,
          className: "",
          displayAvatar: true,
          displayFullName: true,
        },
      } as any,
    ]);
  },
  aliases: ["group", "group"],
  group: "Relations",
  icon: <GroupIcon />,
  subtext: "Used to insert a group inline.",
});

export const groupInlineContentSpec = createReactInlineContentSpec(
  {
    type: "group",
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
    },
    content: "none",
  } as const,
  {
    render: ({
      inlineContent: {
        props: { id, className },
      },
    }): React.ReactNode => {
      return (
        <BlockNoteEditorContext.Consumer>
          {(editor) =>
            editor ? (
              <RelationInlineContentComponent
                editor={editor}
                relation="group"
                id={id}
                relationProps={{ id, className }}
                relationRenderer={{
                  group: (props) => (
                    <GroupChipBox
                      className={props.className}
                      style={{ display: "inline-block" }}
                      displayName={true}
                      avatarSize="xsmall"
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
