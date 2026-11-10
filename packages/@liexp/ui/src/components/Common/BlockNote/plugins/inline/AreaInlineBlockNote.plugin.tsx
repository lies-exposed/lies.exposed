import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { createReactInlineContentSpec } from "@blocknote/react";
import {
  type BNESchemaEditor,
  areaInlineSpec,
} from "@liexp/shared/lib/providers/blocknote/index.js";
import * as React from "react";
import { AreaChipBox } from "../../../../../containers/areas/AreaChipBox.js";
import { AreaIcon } from "../../../Icons/FAIcon.js";
import { BlockNoteEditorContext } from "../../BlockNoteEditorContext.js";
import { RelationInlineContentComponent } from "./RelationInlineBlockNote.plugin.js";

export interface AreaInlineState {
  id: string;
  displayLabel: boolean;
  displayFeaturedImage: boolean;
}

interface AreaInlineProps {
  id: string;
  className: string;
  displayLabel: boolean;
  displayFeaturedImage: boolean;
}

// Custom Slash Menu item to insert a block after the current one.
export const areaItem = (editor: BNESchemaEditor) => ({
  title: "Add Area Inline",
  key: "area",
  onItemClick: () => {
    // Inserting the content inline
    editor.insertInlineContent([
      {
        type: "area",
        props: {
          id: "",
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
  areaInlineSpec,
  {
    render: ({
      inlineContent: {
        props,
      },
    }): React.ReactNode => {
      const areaProps = props as AreaInlineProps;
      return (
        <BlockNoteEditorContext.Consumer>
          {(editor) =>
            editor ? (
              <RelationInlineContentComponent
                editor={editor}
                relation="area"
                id={areaProps.id}
                relationProps={{ id: areaProps.id }}
                relationRenderer={{
                  area: (props) => (
                    <AreaChipBox
                      className={areaProps.className}
                      style={{ display: "inline-block" }}
                      id={props.id as UUID}
                      displayLabel={areaProps.displayLabel}
                      displayFeaturedMedia={areaProps.displayFeaturedImage}
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
