import { filterSuggestionItems } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import {
  type DefaultReactSuggestionItem,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import { type BNESchemaEditor } from "@liexp/shared/lib/providers/blocknote/index.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { styled } from "../../../theme/index.js";
import { BlockNoteEditorContext } from "./BlockNoteEditorContext.js";
import { schema } from "./EditorSchema.js";
import {
  insertUncategorizedEventBlock,
  insertDocumentaryEventBlock,
  insertQuoteEventBlock,
  insertDeathEventBlock,
  insertScientificStudyEventBlock,
  insertBookEventBlock,
  insertPatentEventBlock,
  insertTransactionEventBlock,
} from "./plugins/block/EventBlock.plugin.js";
import { insertLinkBlock } from "./plugins/block/LinkBlock.plugin.js";
import { insertMediaBlock } from "./plugins/block/MediaBlock.plugin.js";
import { actorItem } from "./plugins/inline/ActorInlineBlockNote.plugin.js";
import { areaItem } from "./plugins/inline/AreaInlineBlockNote.plugin.js";
import { groupItem } from "./plugins/inline/GroupInlineBlockNote.plugin.js";
import { keywordItem } from "./plugins/inline/KeywordInlineBlockNote.plugin.js";
import { relationItem } from "./plugins/inline/RelationInlineBlockNote.plugin.js";
import { toInitialContent } from "./utils/utils.js";

const getCustomSlashMenuItems = (
  editor: BNESchemaEditor,
): DefaultReactSuggestionItem[] => {
  return [
    ...getDefaultReactSlashMenuItems(editor),
    relationItem(editor),
    groupItem(editor),
    actorItem(editor),
    areaItem(editor),
    keywordItem(editor),
    // blocks
    insertBookEventBlock(editor),
    insertDeathEventBlock(editor),
    insertDocumentaryEventBlock(editor),
    insertPatentEventBlock(editor),
    insertQuoteEventBlock(editor),
    insertScientificStudyEventBlock(editor),
    insertTransactionEventBlock(editor),
    insertUncategorizedEventBlock(editor),
    insertMediaBlock(editor),
    insertLinkBlock(editor),
  ];
};

export interface BNEditorProps {
  readOnly: boolean;
  content: BNESchemaEditor["document"] | null;
  onChange?: (content: BNESchemaEditor["document"]) => void;
}

const ThemedBlockNoteView =
  (theme: "light" | "dark"): React.FC<any> =>
  (props) => <BlockNoteView {...props} theme={theme} />;

const StyledBlockNoteView = styled(ThemedBlockNoteView("light"))(
  ({ editable }) => ({
    [".bn-editor"]: {
      paddingLeft: !editable ? 0 : 54,
      paddingRight: !editable ? 0 : 54,
    },
  }),
);

export const BNEditor: React.FC<BNEditorProps> = ({
  content,
  readOnly = true,
  onChange,
}) => {
  const initialContent = toInitialContent(content);

  const editor = useCreateBlockNote({
    schema,
    initialContent: initialContent.initialContent
      ? (initialContent.initialContent as any)
      : undefined,
  }) as unknown as BNESchemaEditor;

  const slashMenuItems = React.useMemo(() => {
    if (editor.isEditable) {
      return getCustomSlashMenuItems(editor);
    }
    return [];
  }, [editor.isEditable]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <BlockNoteEditorContext.Provider value={editor}>
        <StyledBlockNoteView
          editor={editor}
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
              return pipe(
                slashMenuItems,
                (suggestions) => filterSuggestionItems(suggestions, query),
                (items) => Promise.resolve(items),
              );
            }}
          />
        </StyledBlockNoteView>
      </BlockNoteEditorContext.Provider>
    </div>
  );
};
