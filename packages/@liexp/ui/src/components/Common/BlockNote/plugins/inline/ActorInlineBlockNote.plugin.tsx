import { createReactInlineContentSpec } from "@blocknote/react";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import {
  type BNESchemaEditor,
  actorInlineSpec,
} from "@liexp/shared/lib/providers/blocknote/index.js";
import * as React from "react";
import ActorChipBox from "../../../../../containers/actors/ActorChipBox.js";
import { Typography } from "../../../../mui/index.js";
import { ActorIcon } from "../../../Icons/FAIcon.js";
import { BlockNoteEditorContext } from "../../BlockNoteEditorContext.js";
import { RelationInlineContentComponent } from "./RelationInlineBlockNote.plugin.js";

export interface ActorInlineState {
  id: string;
  displayAvatar: boolean;
  displayFullName: boolean;
}

interface ActorInlineProps {
  id: string;
  fullName: string;
  className: string;
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
          id: "missing-id",
          fullName: "",
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
    render: ({ inlineContent: { props } }): React.ReactNode => {
      const actorProps = props as ActorInlineProps;
      return (
        <BlockNoteEditorContext.Consumer>
          {(editor) =>
            editor?.isEditable ? (
              <RelationInlineContentComponent
                editor={editor}
                relation="actor"
                id={actorProps.id}
                relationProps={{
                  displayFullName: actorProps.displayFullName,
                  id: actorProps.id,
                }}
                relationRenderer={{
                  actor: (props) => (
                    <ActorChipBox
                      className={actorProps.className}
                      style={{ display: "inline-block" }}
                      displayFullName={actorProps.displayFullName}
                      displayAvatar={actorProps.displayAvatar}
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
              <Typography>{actorProps.fullName}</Typography>
            )
          }
        </BlockNoteEditorContext.Consumer>
      );
    },
  },
);
