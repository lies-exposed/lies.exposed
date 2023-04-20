import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from "lexical";
import * as React from "react";
import { $createActorNode, type ActorPayload } from '../../nodes/ActorNode';

interface InsertActorPayload extends ActorPayload {}

export const INSERT_ACTOR_RULE_COMMAND: LexicalCommand<InsertActorPayload> =
  createCommand("insert-actor");

export default function ActorPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    editor.registerCommand<InsertActorPayload>(
      INSERT_ACTOR_RULE_COMMAND,
      (payload) => {
        const actorNode = $createActorNode(payload);
        $insertNodes([actorNode]);

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
