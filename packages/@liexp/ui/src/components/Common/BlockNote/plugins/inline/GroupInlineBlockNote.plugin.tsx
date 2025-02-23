import { createReactInlineContentSpec } from "@blocknote/react";
import {
  type BNESchemaEditor,
  groupInlineSpec,
} from "@liexp/shared/lib/providers/blocknote/index.js";
import * as React from "react";
import GroupChipBox from "../../../../../containers/groups/GroupChipBox.js";
import { Typography } from "../../../../mui/index.js";
import { GroupIcon } from "../../../Icons/FAIcon.js";
import { BlockNoteEditorContext } from "../../BlockNoteEditorContext.js";
import { RelationInlineContentComponent } from "./RelationInlineBlockNote.plugin.js";

export interface GroupInlineState {
  id: string;
  name: string;
  displayAvatar: boolean;
}

// Custom Slash Menu item to insert a block after the current one.
export const groupItem = (editor: BNESchemaEditor) => ({
  title: "Add Group Inline",
  key: "group",
  onItemClick: () => {
    // Inserting the content inline
    editor.insertInlineContent([
      {
        type: "group",
        props: {
          id: undefined as any,
          name: undefined as any,
          className: "",
          displayAvatar: true,
        },
      },
    ]);
  },
  aliases: ["group", "group"],
  group: "Relations",
  icon: <GroupIcon />,
  subtext: "Used to insert a group inline.",
});

export const groupInlineContentSpec = createReactInlineContentSpec(
  groupInlineSpec,
  {
    render: ({
      inlineContent: {
        props: { id, name, className },
      },
    }): React.ReactNode => {
      return (
        <BlockNoteEditorContext.Consumer>
          {(editor) =>
            editor?.isEditable ? (
              <RelationInlineContentComponent
                editor={editor}
                relation="group"
                id={id}
                relationProps={{ id, name, className }}
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
            ) : (
              <Typography>{name}</Typography>
            )
          }
        </BlockNoteEditorContext.Consumer>
      );
    },
  },
);
