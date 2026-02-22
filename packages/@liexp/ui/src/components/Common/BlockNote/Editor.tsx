import { filterSuggestionItems } from "@blocknote/core/extensions";
import { BlockNoteView } from "@blocknote/mantine";
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  type DefaultReactSuggestionItem,
  FormattingToolbar,
  FormattingToolbarController,
  NestBlockButton,
  SuggestionMenuController,
  TextAlignButton,
  UnnestBlockButton,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { type ResourcesNames } from "@liexp/io/lib/http/ResourcesNames.js";
import { type BNESchemaEditor } from "@liexp/shared/lib/providers/blocknote/index.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { useThemeMode } from "../../../context/ThemeContext.js";
import { styled } from "../../../theme/index.js";
import { BlockNoteEditorContext } from "./BlockNoteEditorContext.js";
import { schema } from "./EditorSchema.js";
import {
  insertBookEventBlock,
  insertDeathEventBlock,
  insertDocumentaryEventBlock,
  insertPatentEventBlock,
  insertQuoteEventBlock,
  insertScientificStudyEventBlock,
  insertTransactionEventBlock,
  insertUncategorizedEventBlock,
} from "./plugins/block/EventBlock.plugin.js";
import { insertLinkBlock } from "./plugins/block/LinkBlock.plugin.js";
import { insertMediaBlock } from "./plugins/block/MediaBlock.plugin.js";
import { actorItem } from "./plugins/inline/ActorInlineBlockNote.plugin.js";
import { areaItem } from "./plugins/inline/AreaInlineBlockNote.plugin.js";
import { groupItem } from "./plugins/inline/GroupInlineBlockNote.plugin.js";
import { keywordItem } from "./plugins/inline/KeywordInlineBlockNote.plugin.js";
import { relationItem } from "./plugins/inline/RelationInlineBlockNote.plugin.js";
import { AIInstructionButton } from "./plugins/toolbar/AIInstructionButton.js";
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
  resource?: ResourcesNames;
  resourceId?: UUID;
}

const ThemedBlockNoteView =
  (theme: "light" | "dark"): React.FC<any> =>
  (props) => <BlockNoteView {...props} theme={theme} />;

const createStyledBlockNoteView = (theme: "light" | "dark") =>
  styled(ThemedBlockNoteView(theme))(({ editable }) => ({
    [".bn-editor"]: {
      paddingLeft: !editable ? 0 : 54,
      paddingRight: !editable ? 0 : 54,
    },
  }));

export const BNEditor: React.FC<BNEditorProps> = ({
  content,
  readOnly = true,
  onChange,
  resource,
  resourceId,
}) => {
  const { resolvedMode } = useThemeMode();
  const initialContent = toInitialContent(content);

  const editor = useCreateBlockNote({
    schema,
    initialContent: initialContent.initialContent ?? undefined,
  }) as unknown as BNESchemaEditor;

  const slashMenuItems = React.useMemo(() => {
    if (editor.isEditable) {
      return getCustomSlashMenuItems(editor);
    }
    return [];
  }, [editor.isEditable]);

  const StyledBlockNoteView = React.useMemo(
    () => createStyledBlockNoteView(resolvedMode),
    [resolvedMode],
  );

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <BlockNoteEditorContext.Provider value={editor}>
        <StyledBlockNoteView
          editor={editor}
          editable={!readOnly}
          slashMenu={false}
          formattingToolbar={false}
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
          <FormattingToolbarController
            formattingToolbar={() => (
              <FormattingToolbar>
                <BlockTypeSelect key="blockTypeSelect" />

                <BasicTextStyleButton
                  basicTextStyle="bold"
                  key="boldStyleButton"
                />
                <BasicTextStyleButton
                  basicTextStyle="italic"
                  key="italicStyleButton"
                />
                <BasicTextStyleButton
                  basicTextStyle="underline"
                  key="underlineStyleButton"
                />
                <BasicTextStyleButton
                  basicTextStyle="strike"
                  key="strikeStyleButton"
                />
                <BasicTextStyleButton
                  basicTextStyle="code"
                  key="codeStyleButton"
                />

                <TextAlignButton
                  textAlignment="left"
                  key="textAlignLeftButton"
                />
                <TextAlignButton
                  textAlignment="center"
                  key="textAlignCenterButton"
                />
                <TextAlignButton
                  textAlignment="right"
                  key="textAlignRightButton"
                />

                <ColorStyleButton key="colorStyleButton" />

                <NestBlockButton key="nestBlockButton" />
                <UnnestBlockButton key="unnestBlockButton" />

                <CreateLinkButton key="createLinkButton" />

                {resource && resourceId ? (
                  <AIInstructionButton
                    key="aiInstructionButton"
                    resource={resource}
                    resourceId={resourceId}
                  />
                ) : null}
              </FormattingToolbar>
            )}
          />
        </StyledBlockNoteView>
      </BlockNoteEditorContext.Provider>
    </div>
  );
};
