import {
  type InitialEditorStateType,
  LexicalComposer,
  type InitialConfigType,
} from "@lexical/react/LexicalComposer";
import {
  type LexicalEditor as Editor
} from "lexical";
import * as React from "react";
import { styled } from "../../../theme";
import { Box } from "../../mui";
import {
  LexicalEditorComposer,
  type LexicalEditorComposerProps,
} from "./EditorComposer";
import { nodes } from "./nodes";

const theme = {
  // Theme styling goes here
  // ...
};

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: any): void {
  // eslint-disable-next-line no-console
  console.error(error);
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

/**
 * Parse the given value and use it to update editor state
 *
 * @param v The value obtained from
 * @returns (e: Editor) => void
 */
const defaultGetValue =
  (v: any) =>
  (e: Editor): void => {
    e.update(() => {
      e.setEditorState(e.parseEditorState(v));
    });
  };

export interface LexicalEditorProps extends LexicalEditorComposerProps {
  value?: InitialEditorStateType;
}

export const LexicalEditor: React.FC<LexicalEditorProps> = ({
  value,
  readOnly,
  ...props
}) => {
  const initialConfig: InitialConfigType = {
    namespace: PREFIX,
    theme,
    onError,
    editable: !readOnly,
    nodes,
    editorState:
      value === undefined
        ? undefined
        : typeof value === "function"
        ? value
        : defaultGetValue(value),
  };

  return (
    <StyledBox className={classes.root}>
      <LexicalComposer initialConfig={initialConfig}>
        <LexicalEditorComposer {...props} readOnly={readOnly} />
      </LexicalComposer>
    </StyledBox>
  );
};
