import { useBlockNoteEditor } from "@blocknote/react";
import { type BNESchemaEditor } from "@liexp/shared/lib/providers/blocknote/type.js";
import * as React from "react";
import { BNEditor } from "./index.js";

export const MarkdownRenderer: React.FC<{ children: string }> = ({
  children,
}) => {
  const [blocks, setBlocks] = React.useState<BNESchemaEditor["document"]>([]);
  const editor = useBlockNoteEditor();

  React.useEffect(() => {
    const blocks = editor.tryParseMarkdownToBlocks(children);
    setBlocks(blocks as BNESchemaEditor["document"]);
  }, [children]);

  return <BNEditor content={blocks} readOnly />;
};
