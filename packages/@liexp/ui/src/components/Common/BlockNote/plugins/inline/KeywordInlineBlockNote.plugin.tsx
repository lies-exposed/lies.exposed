import { createReactInlineContentSpec } from "@blocknote/react";
import * as React from "react";
import KeywordChipBox from "../../../../../containers/keywords/KeywordChipBox.js";
import { Icons } from "../../../../mui/index.js";
import { BlockNoteEditorContext } from "../../BlockNoteEditorContext.js";
import { BNESchemaEditor } from "../../EditorSchema.js";
import { RelationInlineContentComponent } from "./RelationInlineBlockNote.plugin.js";

export interface GroupInlineState {
  id: string;
}

// Custom Slash Menu item to insert a block after the current one.
export const keywordItem = (editor: BNESchemaEditor) => ({
  title: "Add Keyword Inline",
  onItemClick: () => {
    // Inserting the content inline
    editor.insertInlineContent([
      {
        type: "keyword",
        props: {
          id: undefined,
        },
      } as any,
    ]);
  },
  aliases: ["keyword", "kw"],
  group: "Relations",
  icon: <Icons.RecentKeywordsIcon />,
  subtext: "Used to insert a keyword inline.",
});

export const keywordInlineContentSpec = createReactInlineContentSpec(
  {
    type: "keyword",
    propSchema: {
      id: {
        default: "",
      },
    },
    content: "none",
  } as const,
  {
    render: ({
      inlineContent: {
        props: { id },
      },
    }): React.ReactNode => {
      return (
        <BlockNoteEditorContext.Consumer>
          {(editor) =>
            editor ? (
              <RelationInlineContentComponent
                editor={editor}
                relation="keyword"
                id={id}
                relationProps={{ id }}
                relationRenderer={{
                  keyword: ({ id }) => (
                    <KeywordChipBox
                      style={{ display: "inline-block" }}
                      id={id}
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
