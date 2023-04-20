import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import * as React from "react";
import { styled } from "../../../theme";
import { Box } from "../../mui";
import ActorPlugin from "./plugins/ActorPlugin";
import ComponentPickerMenuPlugin from "./plugins/ComponentPickerPlugin";
import MediaPlugin from "./plugins/MediaPlugin";
import { ResourcesSummaryPlugin } from "./plugins/ResourcesSummaryPlugin";
import TableOfContentsPlugin from "./plugins/TableOfContentsPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";

export interface LexicalEditorComposerProps {
  readOnly?: boolean;
  richText?: boolean;
  debug?: boolean;
  onChange: (e: any) => void;
}

const PREFIX = "lexical-editor";
const classes = {
  root: `${PREFIX}-root`,
  editorContainer: `${PREFIX}-editor-container`,
};
const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {},
  [` .${classes.editorContainer}`]: {
    ".editor": {
      padding: theme.spacing(2),
    },
  },
}));

export const LexicalEditorComposer: React.FC<LexicalEditorComposerProps> = ({
  readOnly = true,
  richText: isRichText = true,
  onChange,
  debug = false,
}) => {
  const placeholder = <div>Enter some text...</div>;

  return (
    <StyledBox className={classes.root}>
      {isRichText ? <ToolbarPlugin /> : <div />}
      <>
        <AutoFocusPlugin />
        <div className={classes.editorContainer}>
          {isRichText ? (
            <>
              <RichTextPlugin
                contentEditable={
                  <div className="editor-scroller">
                    <div className="editor">
                      <ContentEditable />
                    </div>
                  </div>
                }
                placeholder={placeholder}
                ErrorBoundary={LexicalErrorBoundary}
              />
              <MediaPlugin />
              <ActorPlugin />
              <ComponentPickerMenuPlugin />
              <ResourcesSummaryPlugin />
              {debug ? <TreeViewPlugin /> : null}
              <ClearEditorPlugin />
              <TableOfContentsPlugin />
            </>
          ) : (
            <>
              <PlainTextPlugin
                contentEditable={<ContentEditable />}
                placeholder={placeholder}
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
            </>
          )}
        </div>
        <OnChangePlugin
          onChange={(e) => {
            onChange?.(e);
          }}
        />
      </>
    </StyledBox>
  );
};
