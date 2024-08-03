import { createReactInlineContentSpec } from "@blocknote/react";
import * as React from "react";
import { AreaChipBox } from "../../../../../containers/areas/AreaChipBox.js";
import { AreaIcon } from "../../../Icons/FAIcon.js";
import { BlockNoteEditorContext } from "../../BlockNoteEditorContext.js";
import { type BNESchemaEditor } from "../../EditorSchema.js";
import { RelationInlineContentComponent } from "./RelationInlineBlockNote.plugin.js";

export interface AreaInlineState {
  id: string;
  displayLabel: boolean;
  displayFeaturedImage: boolean;
}

// Custom Slash Menu item to insert a block after the current one.
export const areaItem = (editor: BNESchemaEditor) => ({
  title: "Add Area Inline",
  key: 'area',
  onItemClick: () => {
    // Inserting the content inline
    editor.insertInlineContent([
      {
        type: "area",
        props: {
          id: undefined as any,
          className: "",
          displayLabel: true,
          displayFeaturedImage: false,
        },
      },
    ]);
  },
  aliases: ["area", "ar"],
  group: "Relations",
  icon: <AreaIcon />,
  subtext: "Used to insert an area inline.",
});

export const areaInlineContentSpec = createReactInlineContentSpec(
  {
    type: "area",
    propSchema: {
      id: {
        default: "",
      },
      className: {
        default: "",
      },
      displayLabel: {
        default: true,
      },
      displayFeaturedImage: {
        default: false,
      },
    },
    content: "none",
  } as const,
  {
    render: ({
      inlineContent: {
        props: { id, className, displayLabel, displayFeaturedImage },
      },
    }): React.ReactNode => {
      return (
        <BlockNoteEditorContext.Consumer>
          {(editor) =>
            editor ? (
              <RelationInlineContentComponent
                editor={editor}
                relation="area"
                id={id}
                relationProps={{ id }}
                relationRenderer={{
                  area: (props) => (
                    <AreaChipBox
                      className={className}
                      style={{ display: "inline-block" }}
                      id={props.id}
                      displayLabel={displayLabel}
                      displayFeaturedMedia={displayFeaturedImage}
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
