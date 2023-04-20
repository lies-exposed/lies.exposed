import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from "lexical";
import * as React from "react";
import { $createMediaNode, type MediaPayload } from "../../nodes/MediaNode";

interface InsertMediaPayload extends MediaPayload {}

export const INSERT_MEDIA_RULE_COMMAND: LexicalCommand<InsertMediaPayload> =
  createCommand("insert-media");

export default function MediaPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    editor.registerCommand<InsertMediaPayload>(
      INSERT_MEDIA_RULE_COMMAND,
      (payload) => {
        const mediaNode = $createMediaNode(payload);
        $insertNodes([mediaNode]);

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
