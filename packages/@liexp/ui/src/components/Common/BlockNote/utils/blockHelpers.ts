import { type BNESchemaEditor } from "@liexp/shared/lib/providers/blocknote/index.js";

type EditorBlock = Parameters<BNESchemaEditor["insertBlocks"]>[0][number];

// Helper function to replace insertOrUpdateBlockForSlashMenu
export function insertOrUpdateBlock(
  editor: BNESchemaEditor,
  block: EditorBlock,
) {
  const selection = editor.getSelection();
  if (selection && selection.blocks.length > 0) {
    const firstBlock = selection.blocks[0];
    if (firstBlock && firstBlock.id) {
      editor.insertBlocks([block], firstBlock.id, "after");
      return;
    }
  }
  // Get the current text cursor position and insert after that block
  const textCursorPosition = editor.getTextCursorPosition();
  if (
    !textCursorPosition ||
    !textCursorPosition.block ||
    !textCursorPosition.block.id
  ) {
    return;
  }
  editor.insertBlocks([block], textCursorPosition.block.id, "after");
}
