import { createReactInlineContentSpec } from "@blocknote/react";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
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

interface GroupInlineProps {
  id: string;
  name: string;
  className: string;
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
          id: "",
          name: "",
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
    render: ({ inlineContent: { props } }): React.ReactNode => {
      const groupProps = props as GroupInlineProps;
      return (
        <BlockNoteEditorContext.Consumer>
          {(editor) =>
            editor?.isEditable ? (
              <RelationInlineContentComponent
                editor={editor}
                relation="group"
                id={groupProps.id}
                relationProps={{
                  id: groupProps.id,
                  name: groupProps.name,
                  className: groupProps.className,
                }}
                relationRenderer={{
                  group: (props) => (
                    <GroupChipBox
                      className={groupProps.className}
                      style={{ display: "inline-block" }}
                      displayName={true}
                      avatarSize="xsmall"
                      id={props.id as UUID}
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
              <Typography>{groupProps.name}</Typography>
            )
          }
        </BlockNoteEditorContext.Consumer>
      );
    },
  },
);
