import { useBlockNoteEditor } from "@blocknote/react";
import { type BNESchemaEditor } from "@liexp/shared/lib/providers/blocknote/type.js";
import * as React from "react";
import { BNEditor } from "./BlockNote/index.js";

export const MarkdownRenderer: React.FC<{ children: string }> = ({
  children,
}) => {
  const [blocks, setBlocks] = React.useState<BNESchemaEditor["document"]>([]);
  const editor = useBlockNoteEditor();

  React.useEffect(() => {
    void editor.tryParseMarkdownToBlocks(children).then((blocks) => {
      setBlocks(blocks as BNESchemaEditor["document"]);
    });
  }, [children]);

  return <BNEditor content={blocks} readOnly />;
};
