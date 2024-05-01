import { filterSuggestionItems } from "@blocknote/core";
import {
  BlockNoteView,
  DefaultReactSuggestionItem,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import * as React from "react";
import { BlockNoteEditorContext } from "./BlockNoteEditorContext.js";
import { BNESchemaEditor, schema } from "./EditorSchema.js";
import { insertEvent } from "./plugins/block/EventBlock.plugin.js";
import { insertMedia } from "./plugins/block/MediaBlock.plugin.js";
import { actorItem } from "./plugins/inline/ActorInlineBlockNote.plugin.js";
import { groupItem } from "./plugins/inline/GroupInlineBlockNote.plugin.js";
import { keywordItem } from "./plugins/inline/KeywordInlineBlockNote.plugin.js";
import { relationItem } from "./plugins/inline/RelationInlineBlockNote.plugin.js";
import { toInitialValue } from "./utils/utils.js";

const getCustomSlashMenuItems = (
  editor: BNESchemaEditor,
): DefaultReactSuggestionItem[] => [
  ...getDefaultReactSlashMenuItems(editor),
  relationItem(editor),
  insertMedia(editor),
  groupItem(editor),
  actorItem(editor),
  insertEvent(editor),
  keywordItem(editor),
];

export interface BNEditorProps {
  readOnly: boolean;
  content: BNESchemaEditor["document"];
  onChange?: (content: BNESchemaEditor["document"]) => void;
}

export const BNEditor: React.FC<BNEditorProps> = ({
  content,
  readOnly = true,
  onChange,
}) => {
  const initialContent = toInitialValue(content);

  const editor = useCreateBlockNote({
    schema,
    ...initialContent,
  }) as BNESchemaEditor;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <BlockNoteEditorContext.Provider value={editor}>
        <BlockNoteView
          editor={editor}
          theme="light"
          editable={!readOnly}
          slashMenu={false}
          onChange={() => {
            onChange?.(editor.document);
          }}
        >
          <SuggestionMenuController
            triggerCharacter={"/"}
            // Replaces the default Slash Menu items with our custom ones.
            getItems={async (query) => {
              const suggestions = getCustomSlashMenuItems(editor);
              return Promise.resolve(filterSuggestionItems(suggestions, query));
            }}
          />
        </BlockNoteView>
      </BlockNoteEditorContext.Provider>
    </div>
  );
};
