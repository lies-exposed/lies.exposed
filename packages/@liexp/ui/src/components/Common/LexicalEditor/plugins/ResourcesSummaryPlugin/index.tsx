import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getRoot,
  $getSelection,
  $isElementNode,
  type EditorState,
  type ElementNode,
  type LexicalNode,
} from "lexical";
import * as React from "react";
import { Box, Typography } from "../../../../mui";
import { $isActorNode, type ActorNode } from "../../nodes/ActorNode";
import { $isMediaNode, type MediaNode } from "../../nodes/MediaNode";

const SYMBOLS: Record<string, string> = Object.freeze({
  ancestorHasNextSibling: "|",
  ancestorIsLastChild: " ",
  hasNextSibling: "├",
  isLastChild: "└",
  selectedChar: "^",
  selectedLine: ">",
});

function visitTree(
  currentNode: ElementNode,
  visitor: (node: LexicalNode, indentArr: string[]) => void,
  indent: string[] = []
): void {
  const childNodes = currentNode.getChildren();
  const childNodesLength = childNodes.length;

  childNodes.forEach((childNode, i) => {
    visitor(
      childNode,
      indent.concat(
        i === childNodesLength - 1
          ? SYMBOLS.isLastChild
          : SYMBOLS.hasNextSibling
      )
    );

    if ($isElementNode(childNode)) {
      visitTree(
        childNode,
        visitor,
        indent.concat(
          i === childNodesLength - 1
            ? SYMBOLS.ancestorIsLastChild
            : SYMBOLS.ancestorHasNextSibling
        )
      );
    }
  });
}

interface SummaryContentData {
  actors: ActorNode[];
  media: MediaNode[];
}

function generateContent(editorState: EditorState): SummaryContentData {
  const res: SummaryContentData = { actors: [], media: [] };
  editorState.read(() => {
    const selection = $getSelection();

    visitTree($getRoot(), (node, indent) => {
      if ($isActorNode(node)) {
        res.actors.push(node);
      } else if ($isMediaNode(node)) {
        res.media.push(node);
      }
    });

    return selection === null ? ": null" : selection;
  });

  return res;
}

export const ResourcesSummaryPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const [content, setContent] = React.useState<SummaryContentData | null>(null);

  React.useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        const content = generateContent(editorState);
        setContent(content);
      })
    );
  }, [editor]);
  return (
    <>
      {content?.actors.length ? (
        <Box>
          <Typography>Actors</Typography>
          {content.actors.map((n) => n.decorate())}
        </Box>
      ) : null}
      {content?.media.length ? (
        <Box>
          <Typography>Actors</Typography>
          {content.media.map((n) => n.decorate())}
        </Box>
      ) : null}
    </>
  );
};
